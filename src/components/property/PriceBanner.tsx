import React from 'react';
import { Property } from '../../types';
import { PropertyService } from '../../services/propertyService';
import { AnalyticsService } from '../../services/analyticsService';
import { MessageSquare, MapPin, Maximize2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

interface PriceBannerProps {
  property: Property;
  onScrollToMap: () => void;
  onScrollToWhatsApp: () => void;
}

export const PriceBanner: React.FC<PriceBannerProps> = ({
  property,
  onScrollToMap,
  onScrollToWhatsApp,
}) => {
  const formattedPrice = PropertyService.formatPrice(property.price, property.currency);
  const primaryContact = property.contacts.find((c) => c.is_primary && c.active && c.type === 'whatsapp') ||
    property.contacts.find((c) => c.active && c.type === 'whatsapp');

  const handleHeroWhatsApp = async () => {
    if (primaryContact) {
      await AnalyticsService.trackEvent('whatsapp_click', {
        contact: primaryContact.value,
        source: 'hero_primary_button',
      });
      const url = PropertyService.getWhatsAppUrl(primaryContact.value, property);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      onScrollToWhatsApp();
    }
  };

  const handleHeroMaps = async () => {
    await AnalyticsService.trackEvent('map_click', { source: 'hero_maps_button' });
    const mapsUrl = PropertyService.getGoogleMapsUrl(property.latitude, property.longitude);
    if (mapsUrl && property.location_verified) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      onScrollToMap();
    }
  };

  return (
    <section className="bg-white border-b border-neutral-200/70 pt-6 pb-8 sm:pt-10 sm:pb-12 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Main Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200/70">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Vente Exclusive • Titre Foncier / Succession
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-600 font-medium">Réf : {property.slug}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              {property.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                <Maximize2 className="w-4 h-4 text-emerald-600" />
                <span>Superficie : <strong className="text-neutral-900 font-bold">{property.surface} {property.unit}</strong></span>
              </div>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{property.city || property.country}</span>
              </div>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-1.5 text-neutral-700">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>Vendeur : <strong className="text-neutral-900">{property.seller?.name || 'Abdou KAMARA'}</strong></span>
              </div>
            </div>
          </div>

          {/* Visually Dominant Price Block (55 000 000 FCFA) */}
          <div className="bg-neutral-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col justify-between shrink-0 lg:min-w-[340px] border border-neutral-800">
            <div>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Prix officiel du bien
              </span>
              <div className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
                <span className="text-emerald-400">{formattedPrice}</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Paiement direct • Transaction sécurisée
              </p>
            </div>

            {/* Quick Action Buttons in Hero */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
              <button
                id="hero-whatsapp-btn"
                onClick={handleHeroWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
                <span>💬 WhatsApp</span>
              </button>

              <button
                id="hero-maps-btn"
                onClick={handleHeroMaps}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-sm font-semibold rounded-xl border border-neutral-700 transition-all active:scale-95 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>🗺️ Localiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
