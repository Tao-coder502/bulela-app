
import { SyncStatus, SyncQueueItem } from './types';
import { UsageService } from './services/UsageService';
import { ErrorLibrary } from './services/ErrorLibrary';

const DB_NAME = 'BulelaDB';
const STORE_NAME = 'sync_queue';

export class SyncService {
  private static listeners: ((status: SyncStatus) => void)[] = [];
  private static currentStatus: SyncStatus = navigator.onLine ? SyncStatus.SYNCED : SyncStatus.OFFLINE;
  private static toastCallback: ((message: string) => void) | null = null;
  private static isProcessing = false;
  private static db: IDBDatabase | null = null;
  private static tokenGetter: (() => Promise<string | null>) | null = null;
  private static isInitialized = false;
  private static userId: string | null = null;

  static async init(userId: string, tokenGetter: () => Promise<string | null>) {
    if (this.isInitialized && this.userId === userId) return;
    this.isInitialized = true;
    this.userId = userId;
    this.tokenGetter = tokenGetter;
    await this.initDB();
    
    window.addEventListener('online', () => {
      this.handleStatusChange(SyncStatus.SYNCING, userId);
      this.processSync(userId);
    });
    
    window.addEventListener('offline', () => {
      this.handleStatusChange(SyncStatus.OFFLINE, userId);
    });
    
    if (navigator.onLine) {
      this.processSync(userId);
    }

    // Periodic Sync: Every 30 seconds
    setInterval(() => {
      if (navigator.onLine) {
        this.processSync(userId);
      }
    }, 30000);
  }

  private static initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onerror = () => reject(new Error("IndexedDB failed"));
    });
  }

  static subscribe(callback: (status: SyncStatus) => void) {
    this.listeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  static onSyncComplete(callback: (message: string) => void) {
    this.toastCallback = callback;
  }

  private static handleStatusChange(status: SyncStatus, userId?: string) {
    this.currentStatus = status;
    this.listeners.forEach(l => l(status));
  }

  /**
   * Idempotent Queue: Saves to IndexedDB.
   */
  static async queueItem(userId: string, type: SyncQueueItem['type'], payload: any) {
    const clientEventId = crypto.randomUUID();
    
    const enrichedPayload = { 
      ...payload, 
      userId, 
      clientEventId,
      dailyAiUsageCount: UsageService.getDailyCount() 
    };
    
    const newItem: SyncQueueItem = {
      id: clientEventId,
      type,
      payload: enrichedPayload, 
      timestamp: Date.now(),
      status: 'PENDING'
    };
    
    await this.addToQueue(newItem);
    
    if (navigator.onLine) {
      this.processSync(userId);
    } else {
      this.handleStatusChange(SyncStatus.OFFLINE, userId);
      const err = ErrorLibrary.get(0);
      this.toastCallback?.(err.persona);
    }
  }

  private static addToQueue(item: SyncQueueItem): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("DB not ready"));
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).add(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private static getQueue(): Promise<SyncQueueItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private static clearQueue(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Resilient Processor: Sends queue to /api/sync and flushes on success.
   */
  static async processSync(userId: string) {
    if (this.isProcessing) return;
    const queue = await this.getQueue();
    
    if (queue.length === 0) {
      this.handleStatusChange(SyncStatus.SYNCED, userId);
      return;
    }

    this.isProcessing = true;
    this.handleStatusChange(SyncStatus.SYNCING, userId);
    
    // Mark all items in queue as PENDING before sending
    await this.updateQueueStatus('PENDING');

    try {
      const token = this.tokenGetter ? await this.tokenGetter() : null;
      
      // Use absolute URL to avoid any relative path issues in complex environments
      const syncUrl = `${window.location.origin}/api/sync`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ userId, items: queue }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Sync] Server returned error:", response.status, errorData);
        throw { status: response.status, data: errorData };
      }
      
      await this.clearQueue();
      this.handleStatusChange(SyncStatus.SYNCED, userId);
      this.toastCallback?.("Cloud sync completed.");
    } catch (error: any) {
      console.error("[Sync] Sync failed critically:", error);
      
      // If it's a TypeError (like "Failed to fetch"), it's a network issue
      const isNetworkError = error instanceof TypeError || error.name === 'TypeError' || !error.status;
      
      this.handleStatusChange(SyncStatus.OFFLINE, userId);
      
      const err = ErrorLibrary.get(error.status || 0);
      this.toastCallback?.(err.persona);
      
      // Mark as failed in DB
      await this.updateQueueStatus('FAILED');
    } finally {
      this.isProcessing = false;
    }
  }

  private static async updateQueueStatus(status: 'PENDING' | 'FAILED'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const items = request.result;
        if (items.length === 0) return resolve();
        
        let completed = 0;
        items.forEach(item => {
          item.status = status;
          const putReq = store.put(item);
          putReq.onsuccess = () => {
            completed++;
            if (completed === items.length) resolve();
          };
          putReq.onerror = () => reject(putReq.error);
        });
      };
      request.onerror = () => reject(request.error);
    });
  }
}
