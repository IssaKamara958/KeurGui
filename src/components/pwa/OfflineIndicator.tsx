import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600 text-white px-4 py-2 text-xs font-semibold shadow-xl border border-amber-400/40 animate-pulse">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Mode hors ligne actif — Consultation fluide via le cache PWA</span>
    </div>
  );
};
