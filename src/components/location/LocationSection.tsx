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
  Clock,
  Calendar,
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
      <div className="flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Localisation du bien</h2>
          </div>

          {/* Pastille Visite estimée : 10 min */}
          <a
            href="#whatsapp-contact-section"
            title="Planifier une visite réelle du bien (10 min)"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80 shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Visite estimée : 10 min</span>
            <span className="text-2xs text-emerald-600/75 dark:text-emerald-400/75 hidden sm:inline group-hover:underline">
              • Planifier
            </span>
          </a>
        </div>

        {onOpenLocationAdmin && (
          <button
            onClick={onOpenLocationAdmin}
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:underline cursor-pointer"
          >
            Modifier GPS
          </button>
        )}
      </div>

      {/* Verification notice */}
      {!property.location_verified ? (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm transition-colors">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">⚠️ Position géographique à confirmer</span> : l'emplacement exact
            sera transmis directement par le vendeur Abdou KAMARA lors de la prise de contact.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm transition-colors">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Position GPS vérifiée et validée par le vendeur.</span>
        </div>
      )}

      {/* Location Details Box */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-xs transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase">Zone & Ville</span>
            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-base mt-0.5">
              {property.city || 'Sénégal'}
              {property.neighborhood ? ` — ${property.neighborhood}` : ''}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{property.country}</p>
          </div>

          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase">Coordonnées GPS</span>
            <p className="font-mono text-neutral-800 dark:text-neutral-200 text-sm mt-0.5">
              {hasCoordinates
                ? `${property.latitude?.toFixed(5)}, ${property.longitude?.toFixed(5)}`
                : 'Localisation GPS non renseignée'}
            </p>
            {property.landmark && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Repère : {property.landmark}</p>
            )}
          </div>
        </div>

        {property.address && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 text-sm">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase">Adresse indicative</span>
            <p className="text-neutral-800 dark:text-neutral-200 mt-0.5">{property.address}</p>
          </div>
        )}

        {/* Visite estimée : 10 min Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-neutral-900 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Visite estimée : 10 min
                </span>
                <span className="px-1.5 py-0.5 rounded text-3xs font-bold uppercase bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  Sur place
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Découvrez la maison et les 600 m² de terrain en conditions réelles avec le mandataire officiel.
              </p>
            </div>
          </div>
          <a
            href="#whatsapp-contact-section"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Planifier ma visite</span>
          </a>
        </div>

        {/* Action buttons: Google Maps & Copy Address */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {googleMapsUrl ? (
            <button
              id="open-google-maps-btn"
              onClick={handleOpenGoogleMaps}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs sm:text-sm font-semibold rounded-xl border border-transparent dark:border-neutral-700 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>🗺️ Ouvrir dans Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => showToast('Coordonnées GPS en attente de configuration', 'info')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm font-medium rounded-xl cursor-not-allowed"
            >
              <Navigation className="w-4 h-4" />
              <span>Localisation GPS non renseignée</span>
            </button>
          )}

          <button
            id="copy-address-btn"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-semibold rounded-xl border border-transparent dark:border-neutral-700 transition-colors active:scale-95 cursor-pointer"
          >
            <Copy className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span>📋 Copier l'adresse</span>
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm bg-neutral-100 dark:bg-neutral-900 h-64 sm:h-80">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-sm border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>OpenStreetMap • Sénégal</span>
        </div>
      </div>
    </section>
  );
};
