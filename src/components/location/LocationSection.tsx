import React, { useEffect, useRef } from 'react';
import { Property } from '../../types';
import { PropertyService } from '../../services/propertyService';
import { AnalyticsService } from '../../services/analyticsService';
import { useToast } from '../ui/Toast';
import {
  MapPin,
  ExternalLink,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Compass,
} from 'lucide-react';
import L from 'leaflet';

interface LocationSectionProps {
  property: Property;
  onOpenLocationAdmin?: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  property,
  onOpenLocationAdmin,
}) => {
  const { showToast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const hasCoordinates =
    property.latitude !== null &&
    property.longitude !== null &&
    !isNaN(property.latitude) &&
    !isNaN(property.longitude);

  const googleMapsUrl = PropertyService.getGoogleMapsUrl(property.latitude, property.longitude);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on coordinates or default to Thiès, Sénégal
    const lat = hasCoordinates ? (property.latitude as number) : 14.7932;
    const lng = hasCoordinates ? (property.longitude as number) : -16.9265;
    const zoomLevel = hasCoordinates ? 15 : 12;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([lat, lng], zoomLevel);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom icon for marker
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #059669; color: white; padding: 8px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <strong>${property.title}</strong><br/>
          ${property.surface} ${property.unit} • ${PropertyService.formatPrice(property.price, property.currency)}<br/>
          <em>Vendeur: ${property.seller.name}</em>
        </div>`
      );

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], zoomLevel);
    }

    return () => {
      // do not destroy on re-renders, map stays stable
    };
  }, [property.latitude, property.longitude, hasCoordinates, property.title, property.surface, property.unit, property.price, property.currency, property.seller.name]);

  const handleCopyAddress = async () => {
    const textToCopy = `${property.address || property.city || 'Sénégal'}${
      hasCoordinates ? ` (GPS: ${property.latitude}, ${property.longitude})` : ''
    }`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Adresse copiée dans le presse-papiers', 'success');
    } catch (err) {
      showToast('Erreur lors de la copie', 'error');
    }
  };

  const handleOpenGoogleMaps = async () => {
    await AnalyticsService.trackEvent('map_click', {
      latitude: property.latitude,
      longitude: property.longitude,
    });
    if (googleMapsUrl) {
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      showToast('Coordonnées GPS non encore renseignées', 'info');
    }
  };

  return (
    <section id="location-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-neutral-900">Localisation du bien</h2>
        </div>
        {onOpenLocationAdmin && (
          <button
            onClick={onOpenLocationAdmin}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline cursor-pointer"
          >
            Modifier GPS
          </button>
        )}
      </div>

      {/* Verification notice */}
      {!property.location_verified ? (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">⚠️ Position géographique à confirmer</span> : l'emplacement exact
            sera transmis directement par le vendeur Abdou KAMARA lors de la prise de contact.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Position GPS vérifiée et validée par le vendeur.</span>
        </div>
      )}

      {/* Location Details Box */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-neutral-500 font-semibold uppercase">Zone & Ville</span>
            <p className="font-bold text-neutral-900 text-base mt-0.5">
              {property.city || 'Sénégal'}
              {property.neighborhood ? ` — ${property.neighborhood}` : ''}
            </p>
            <p className="text-xs text-neutral-500 mt-1">{property.country}</p>
          </div>

          <div>
            <span className="text-xs text-neutral-500 font-semibold uppercase">Coordonnées GPS</span>
            <p className="font-mono text-neutral-800 text-sm mt-0.5">
              {hasCoordinates
                ? `${property.latitude?.toFixed(5)}, ${property.longitude?.toFixed(5)}`
                : 'Localisation GPS non renseignée'}
            </p>
            {property.landmark && (
              <p className="text-xs text-neutral-500 mt-1">Repère : {property.landmark}</p>
            )}
          </div>
        </div>

        {property.address && (
          <div className="border-t border-neutral-100 pt-3 text-sm">
            <span className="text-xs text-neutral-500 font-semibold uppercase">Adresse indicative</span>
            <p className="text-neutral-800 mt-0.5">{property.address}</p>
          </div>
        )}

        {/* Action buttons: Google Maps & Copy Address */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {googleMapsUrl ? (
            <button
              id="open-google-maps-btn"
              onClick={handleOpenGoogleMaps}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>🗺️ Ouvrir dans Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => showToast('Coordonnées GPS en attente de configuration', 'info')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-200 text-neutral-600 text-xs sm:text-sm font-medium rounded-xl cursor-not-allowed"
            >
              <Navigation className="w-4 h-4" />
              <span>Localisation GPS non renseignée</span>
            </button>
          )}

          <button
            id="copy-address-btn"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors active:scale-95 cursor-pointer"
          >
            <Copy className="w-4 h-4 text-neutral-600" />
            <span>📋 Copier l'adresse</span>
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-100 h-64 sm:h-80">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 shadow-sm border border-neutral-200 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>OpenStreetMap • Sénégal</span>
        </div>
      </div>
    </section>
  );
};
