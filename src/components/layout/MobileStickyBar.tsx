import React from 'react';
import { Property } from '../../types';
import { PropertyService } from '../../services/propertyService';
import { AnalyticsService } from '../../services/analyticsService';
import { MessageSquare, MapPin, Phone } from 'lucide-react';

interface MobileStickyBarProps {
  property: Property;
  onScrollToMap: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  property,
  onScrollToMap,
}) => {
  const primaryWhatsApp =
    property.contacts.find((c) => c.is_primary && c.active && c.type === 'whatsapp') ||
    property.contacts.find((c) => c.active && c.type === 'whatsapp');

  const handleWhatsAppClick = async () => {
    if (!primaryWhatsApp) return;
    await AnalyticsService.trackEvent('whatsapp_click', {
      contact: primaryWhatsApp.value,
      source: 'sticky_mobile_bar',
    });
    const url = PropertyService.getWhatsAppUrl(primaryWhatsApp.value, property);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMapClick = async () => {
    await AnalyticsService.trackEvent('map_click', { source: 'sticky_mobile_bar' });
    const mapsUrl = PropertyService.getGoogleMapsUrl(property.latitude, property.longitude);
    if (mapsUrl && property.location_verified) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      onScrollToMap();
    }
  };

  return (
    <aside
      id="mobile-sticky-bar"
      aria-label="Actions rapides"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/90 p-3 sm:hidden shadow-2xl safe-area-bottom"
    >
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* WhatsApp Dominant Button */}
        <button
          id="mobile-whatsapp-action"
          onClick={handleWhatsAppClick}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-current shrink-0" />
          <span>💬 WhatsApp</span>
        </button>

        {/* Localiser Button */}
        <button
          id="mobile-map-action"
          onClick={handleMapClick}
          className="flex items-center justify-center gap-1.5 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl border border-neutral-200 active:scale-95 transition-all cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>🗺️ Localiser</span>
        </button>
      </div>
    </aside>
  );
};
