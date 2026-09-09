import { AnalyticsEventType, AnalyticsSummary } from '../types';
import { INITIAL_PROPERTY_DATA } from '../data/initialData';

const ANALYTICS_STORAGE_KEY = 'maison_analytics_v1';

export class AnalyticsService {
  public static async trackEvent(
    eventType: AnalyticsEventType,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          metadata,
        }),
      });
    } catch (err) {
      console.warn('Could not post analytics to server, saving locally:', err);
    }

    // Update local cache as well
    try {
      const current = this.getLocalSummary();
      switch (eventType) {
        case 'page_view':
          current.page_views += 1;
          break;
        case 'whatsapp_click':
          current.whatsapp_clicks += 1;
          current.total_interactions += 1;
          break;
        case 'phone_click':
          current.phone_clicks += 1;
          current.total_interactions += 1;
          break;
        case 'map_click':
          current.map_clicks += 1;
          current.total_interactions += 1;
          break;
        case 'share_click':
          current.share_clicks += 1;
          current.total_interactions += 1;
          break;
        case 'tiktok_click':
          current.tiktok_clicks += 1;
          current.total_interactions += 1;
          break;
        case 'gallery_view':
          current.gallery_views += 1;
          break;
      }
      current.recent_events.unshift({
        id: `local-evt-${Date.now()}`,
        property_id: 'maison-fatou-ba-001',
        event_type: eventType,
        metadata,
        created_at: new Date().toISOString(),
      });
      if (current.recent_events.length > 50) current.recent_events.pop();
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      // ignore
    }
  }

  public static async getSummary(): Promise<AnalyticsSummary> {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API analytics unavailable, using local summary:', err);
    }

    return this.getLocalSummary();
  }

  private static getLocalSummary(): AnalyticsSummary {
    try {
      const cached = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }
    return JSON.parse(JSON.stringify(INITIAL_PROPERTY_DATA.analytics));
  }
}
