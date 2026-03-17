
import React, { useState, useEffect } from 'react';
import { SyncService } from '../SyncService';

const SyncToast: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    SyncService.onSyncComplete((msg) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), 4000);
    });
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom duration-500">
      <div className="bg-copper text-white font-black px-6 py-3 rounded-2xl shadow-2xl border-4 border-silk flex items-center gap-3 ring-4 ring-copper/20">
        <span className="text-xl">📡</span>
        <span className="text-xs uppercase tracking-widest font-black">{message}</span>
      </div>
    </div>
  );
};

export default SyncToast;
