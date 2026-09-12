import React, { useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Bell, BellRing } from 'lucide-react';
import { PushNotificationModal } from './PushNotificationModal';

interface PushNotificationBellProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PushNotificationBell: React.FC<PushNotificationBellProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { unreadCount, settings } = usePushNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        id="pwa-notification-bell-button"
        onClick={() => setIsModalOpen(true)}
        className={`relative flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 ${
          settings.isSubscribed
            ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 hover:bg-amber-500/25 border border-amber-500/30'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
        } ${className}`}
        title={
          settings.isSubscribed
            ? 'Alertes PWA actives (Changement de prix & Étapes)'
            : 'Activer les alertes PWA (Prix & Étapes d\'achat)'
        }
      >
        <div className="relative">
          {settings.isSubscribed ? (
            <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
          ) : (
            <Bell className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          )}

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-amber-500 text-white text-3xs font-bold flex items-center justify-center animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {variant === 'full' ? (
          <span className="font-semibold text-xs">
            {settings.isSubscribed ? 'Alertes PWA' : 'Activer Alertes'}
          </span>
        ) : (
          <span className="hidden xl:inline text-xs font-semibold">
            {settings.isSubscribed ? 'Alertes' : 'Alertes'}
          </span>
        )}
      </button>

      <PushNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
