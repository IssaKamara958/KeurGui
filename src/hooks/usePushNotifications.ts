import { useState, useEffect, useCallback } from 'react';
import {
  PushNotificationItem,
  PushSubscriptionSettings,
} from '../types';
import { PushNotificationService } from '../services/pushNotificationService';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [settings, setSettings] = useState<PushSubscriptionSettings>(() =>
    PushNotificationService.getSettings()
  );
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(() =>
    PushNotificationService.getNotifications()
  );
  const [unreadCount, setUnreadCount] = useState<number>(() =>
    PushNotificationService.getUnreadCount()
  );

  const refreshState = useCallback(() => {
    setSettings(PushNotificationService.getSettings());
    const notifs = PushNotificationService.getNotifications();
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.read).length);
  }, []);

  useEffect(() => {
    setIsSupported(PushNotificationService.isSupported());
    refreshState();

    const handleSettingsUpdated = () => refreshState();
    const handleNotificationsUpdated = () => refreshState();
    const handlePushReceived = () => refreshState();

    window.addEventListener('pwa_push_settings_updated', handleSettingsUpdated);
    window.addEventListener('pwa_notifications_updated', handleNotificationsUpdated);
    window.addEventListener('pwa_push_received', handlePushReceived);

    return () => {
      window.removeEventListener('pwa_push_settings_updated', handleSettingsUpdated);
      window.removeEventListener('pwa_notifications_updated', handleNotificationsUpdated);
      window.removeEventListener('pwa_push_received', handlePushReceived);
    };
  }, [refreshState]);

  const subscribe = async (subscriberInfo?: { name?: string; phone?: string; email?: string }) => {
    const res = await PushNotificationService.requestPermissionAndSubscribe(subscriberInfo);
    refreshState();
    return res;
  };

  const unsubscribe = async () => {
    await PushNotificationService.unsubscribe();
    refreshState();
  };

  const updatePreferences = (updates: Partial<PushSubscriptionSettings>) => {
    PushNotificationService.saveSettings(updates);
    refreshState();
  };

  const markAsRead = (id: string) => {
    PushNotificationService.markAsRead(id);
    refreshState();
  };

  const markAllAsRead = () => {
    PushNotificationService.markAllAsRead();
    refreshState();
  };

  const clearAll = () => {
    PushNotificationService.clearAll();
    refreshState();
  };

  const sendTestPriceAlert = async (newPrice: number = 53000000, oldPrice: number = 55000000) => {
    await PushNotificationService.notifyPriceChange(newPrice, oldPrice, 'FCFA');
    refreshState();
  };

  const sendTestStepAlert = async (
    stepName: string = 'Offre d\'Achat Reçue & Audit Notarial',
    stepDesc: string = 'Une nouvelle étape dans le processus d\'acquisition a été franchie. Le dossier avance vers la signature.',
    milestone: 'visite' | 'offre' | 'compromis' | 'notaire' | 'cles' = 'offre'
  ) => {
    await PushNotificationService.notifyPurchaseStep(stepName, stepDesc, milestone);
    refreshState();
  };

  return {
    isSupported,
    settings,
    notifications,
    unreadCount,
    subscribe,
    unsubscribe,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendTestPriceAlert,
    sendTestStepAlert,
  };
}
