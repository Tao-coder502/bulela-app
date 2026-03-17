import { useState, useEffect } from 'react';
import { SyncStatus } from '../types';
import { SyncService } from '../SyncService';

export const useVillageSync = () => {
  const [status, setStatus] = useState<SyncStatus>(SyncStatus.SYNCED);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to SyncService status changes
    const unsubscribe = SyncService.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    // Listen for sync completion messages
    SyncService.onSyncComplete((message) => {
      setLastSyncMessage(message);
      // Clear message after 3 seconds
      setTimeout(() => setLastSyncMessage(null), 3000);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const triggerSync = async (userId: string) => {
    if (navigator.onLine) {
      await SyncService.processSync(userId);
    }
  };

  return {
    status,
    lastSyncMessage,
    isOffline: status === SyncStatus.OFFLINE,
    isSyncing: status === SyncStatus.SYNCING,
    triggerSync
  };
};
