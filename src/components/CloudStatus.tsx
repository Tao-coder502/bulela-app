
import React, { useState, useEffect } from 'react';
import { SyncService } from '../SyncService';
import { SyncStatus } from '../types';

interface Props {
  forceFlash?: boolean;
}

const CloudStatus: React.FC<Props> = ({ forceFlash }) => {
  const [status, setStatus] = useState<SyncStatus>(SyncStatus.OFFLINE);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    return SyncService.subscribe((newStatus) => setStatus(newStatus));
  }, []);

  useEffect(() => {
    if (forceFlash) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [forceFlash]);

  const getIcon = () => {
    if (isFlashing) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-success animate-bounce">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }

    switch (status) {
      case SyncStatus.SYNCING:
        return (
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-copper animate-spin">
              <path d="M12 13V3m0 0L8 7m4-4l4 4M4 11a8 8 0 1 0 16 0" />
            </svg>
          </div>
        );
      case SyncStatus.SYNCED:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-success">
            <path d="M12 10a4 4 0 0 0-4 4c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2 4 4 0 0 0-4-4Z" />
            <path d="M5 18a2 2 0 0 0-2 2c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2c0-1.1-.9-2-2-2H5Z" />
            <polyline points="9 11 12 14 22 4" strokeDasharray="20" className="animate-in fade-in" />
          </svg>
        );
      case SyncStatus.OFFLINE:
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-rose-400">
            <path d="M17.5 19c.7 0 1.4-.2 2-.6.7-.4 1.2-1 1.5-1.7.3-.7.3-1.5.1-2.2-.2-.7-.6-1.3-1.1-1.8m-3-1.7c-.5-.6-1.2-1.1-1.9-1.4-.7-.3-1.5-.4-2.2-.4-1.2 0-2.3.4-3.2 1.1-.9.7-1.5 1.7-1.8 2.8" />
            <path d="M1 1l22 22" />
          </svg>
        );
    }
  };

  const getLabel = () => {
    if (isFlashing) return "Synced";
    switch (status) {
      case SyncStatus.SYNCING: return "Saving...";
      case SyncStatus.SYNCED: return "Synced";
      case SyncStatus.OFFLINE: return "Offline Mode";
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
      (status === SyncStatus.SYNCED || isFlashing) ? 'bg-success/10 border-success/20 shadow-[0_0_15px_rgba(51,184,115,0.1)]' : 
      status === SyncStatus.SYNCING ? 'bg-copper/5 border-copper/20' : 
      'bg-rose-50 border-rose-100'
    }`}>
      {getIcon()}
      <span className={`text-[10px] font-black uppercase tracking-widest ${
        (status === SyncStatus.SYNCED || isFlashing) ? 'text-success' : 
        status === SyncStatus.SYNCING ? 'text-copper' : 
        'text-rose-500'
      }`}>
        {getLabel()}
      </span>
    </div>
  );
};

export default CloudStatus;
