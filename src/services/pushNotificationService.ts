import {
  PushNotificationCategory,
  PushNotificationItem,
  PushSubscriptionSettings,
} from '../types';
import { AnalyticsService } from './analyticsService';

const SETTINGS_KEY = 'keur_mame_fatou_push_settings_v1';
const NOTIFICATIONS_KEY = 'keur_mame_fatou_push_notifications_v1';

const DEFAULT_SETTINGS: PushSubscriptionSettings = {
  isSubscribed: false,
  notifyPriceChange: true,
  notifyPurchaseStep: true,
  notifyLegalDocuments: true,
  permissionStatus: 'default',
};

const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: 'notif-init-1',
    title: '🏡 Bienvenue sur Keur Mame Fatou',
    body: 'Le service de notifications est prêt. Vous serez alerté en temps réel en cas de changement de prix ou d\'avancement de l\'achat.',
    category: 'system',
    timestamp: new Date().toISOString(),
    read: false,
    badgeText: 'PWA',
    url: '/',
  },
  {
    id: 'notif-init-2',
    title: '📑 Étape 1 validée : Dossier 100% Conforme',
    body: 'Titre foncier, plan de bornage officiel de 600 m² et mandat de vente 12% certifiés par le mandataire M. Abdou KAMARA.',
    category: 'purchase_step',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: true,
    badgeText: 'Étape Achat',
    url: '#caracteristiques',
  },
];

export class PushNotificationService {
  /**
   * Check if web notifications and service workers are supported
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current browser notification permission
   */
  public static getPermissionStatus(): 'default' | 'granted' | 'denied' | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Get stored subscription settings
   */
  public static getSettings(): PushSubscriptionSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      const perm = this.getPermissionStatus();
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          permissionStatus: perm,
          isSubscribed: parsed.isSubscribed && perm === 'granted',
        };
      }
      return {
        ...DEFAULT_SETTINGS,
        permissionStatus: perm,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save subscription settings
   */
  public static saveSettings(updates: Partial<PushSubscriptionSettings>): PushSubscriptionSettings {
    const current = this.getSettings();
    const updated: PushSubscriptionSettings = {
      ...current,
      ...updates,
      permissionStatus: this.getPermissionStatus(),
    };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('pwa_push_settings_updated', { detail: updated }));
    } catch (e) {
      console.warn('Could not save push settings:', e);
    }
    return updated;
  }

  /**
   * Request notification permission from the user & activate subscription
   */
  public static async requestPermissionAndSubscribe(subscriberInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  }): Promise<{ success: boolean; status: string }> {
    if (!this.isSupported()) {
      return { success: false, status: 'unsupported' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const updated = this.saveSettings({
          isSubscribed: true,
          permissionStatus: 'granted',
          subscriberName: subscriberInfo?.name || undefined,
          subscriberPhone: subscriberInfo?.phone || undefined,
          subscriberEmail: subscriberInfo?.email || undefined,
          subscribedAt: new Date().toISOString(),
        });

        await AnalyticsService.trackEvent('push_subscribe', {
          phone: subscriberInfo?.phone,
          timestamp: new Date().toISOString(),
        });

        // Send a welcome confirmation push notification
        await this.dispatchNativeNotification({
          title: '🔔 Alertes PWA activées',
          body: 'Vous recevrez les alertes prioritaires pour tout changement de prix ou nouvelle étape d\'achat de Keur Mame Fatou.',
          category: 'system',
          tag: 'welcome-alert',
          badgeText: 'PWA Active',
        });

        return { success: true, status: 'granted' };
      } else {
        this.saveSettings({
          isSubscribed: false,
          permissionStatus: permission,
        });
        return { success: false, status: permission };
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return { success: false, status: 'error' };
    }
  }

  /**
   * Unsubscribe from push alerts
   */
  public static async unsubscribe(): Promise<void> {
    this.saveSettings({ isSubscribed: false });
    await AnalyticsService.trackEvent('push_unsubscribe', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get all stored notification items
   */
  public static getNotifications(): PushNotificationItem[] {
    if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  /**
   * Get count of unread notifications
   */
  public static getUnreadCount(): number {
    const list = this.getNotifications();
    return list.filter((n) => !n.read).length;
  }

  /**
   * Mark a single notification as read
   */
  public static markAsRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('pwa_notifications_updated'));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Mark all notifications as read
   */
  public static markAllAsRead(): void {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('pwa_notifications_updated'));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Clear all notifications history
   */
  public static clearAll(): void {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('pwa_notifications_updated'));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Dispatch a notification (saves to history and displays native OS push if allowed)
   */
  public static async dispatchNativeNotification(options: {
    title: string;
    body: string;
    category: PushNotificationCategory;
    tag?: string;
    url?: string;
    badgeText?: string;
  }): Promise<PushNotificationItem> {
    const newItem: PushNotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: options.title,
      body: options.body,
      category: options.category,
      timestamp: new Date().toISOString(),
      read: false,
      url: options.url || '/',
      icon: '/pwa-192x192.png',
      badgeText: options.badgeText || 'Alerte',
    };

    // Save to stored notification list
    const currentList = this.getNotifications();
    const updatedList = [newItem, ...currentList].slice(0, 30); // keep up to 30 notifications
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('pwa_notifications_updated'));
      window.dispatchEvent(new CustomEvent('pwa_push_received', { detail: newItem }));
    } catch (e) {
      console.warn('Could not persist notification item:', e);
    }

    // Trigger Native Web Notification if permission is granted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(options.title, {
              body: options.body,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              tag: options.tag || 'keur-mame-fatou-alert',
              vibrate: [200, 100, 200],
              data: { url: options.url || '/' },
            } as NotificationOptions);
            return newItem;
          }
        }
        // Fallback to standard window Notification
        new Notification(options.title, {
          body: options.body,
          icon: '/pwa-192x192.png',
          tag: options.tag || 'keur-mame-fatou-alert',
        });
      } catch (err) {
        console.warn('Native notification display fallback:', err);
      }
    }

    return newItem;
  }

  /**
   * Trigger Price Change Notification
   */
  public static async notifyPriceChange(
    newPrice: number,
    oldPrice: number,
    currency: string = 'FCFA'
  ): Promise<void> {
    const formattedNew = new Intl.NumberFormat('fr-FR').format(newPrice);
    const formattedOld = new Intl.NumberFormat('fr-FR').format(oldPrice);
    const isDrop = newPrice < oldPrice;

    const title = isDrop
      ? `📉 Baisse de prix sur Keur Mame Fatou !`
      : `🏷️ Mise à jour du prix : Keur Mame Fatou`;

    const body = isDrop
      ? `Le prix de la maison (600 m²) passe de ${formattedOld} ${currency} à ${formattedNew} ${currency} (Net vendeur garanti).`
      : `Le prix officiel du bien est désormais fixé à ${formattedNew} ${currency}.`;

    await this.dispatchNativeNotification({
      title,
      body,
      category: 'price_change',
      tag: 'price-update-alert',
      url: '/',
      badgeText: isDrop ? 'Baisse de Prix' : 'Prix Modifié',
    });

    await AnalyticsService.trackEvent('push_notification_sent', {
      type: 'price_change',
      newPrice,
      oldPrice,
    });
  }

  /**
   * Trigger Purchase Process Step Notification
   */
  public static async notifyPurchaseStep(
    stepName: string,
    stepDetails: string,
    milestone: 'visite' | 'offre' | 'compromis' | 'notaire' | 'cles'
  ): Promise<void> {
    const badgeMap: Record<string, string> = {
      visite: 'Étape 1 : Visite',
      offre: 'Étape 2 : Offre',
      compromis: 'Étape 3 : Compromis',
      notaire: 'Étape 4 : Notaire',
      cles: 'Étape 5 : Clés',
    };

    const title = `📍 Processus d'Achat : ${stepName}`;
    const body = `${stepDetails} • Mandataire officiel : M. Abdou KAMARA.`;

    await this.dispatchNativeNotification({
      title,
      body,
      category: 'purchase_step',
      tag: `purchase-step-${milestone}`,
      url: '#whatsapp-contact-section',
      badgeText: badgeMap[milestone] || 'Étape Achat',
    });

    await AnalyticsService.trackEvent('push_notification_sent', {
      type: 'purchase_step',
      step: milestone,
    });
  }
}
