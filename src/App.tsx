import React, { useState, useEffect } from 'react';
import { Property } from './types';
import { PropertyService } from './services/propertyService';
import { AnalyticsService } from './services/analyticsService';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { PriceBanner } from './components/property/PriceBanner';
import { PropertyGallery } from './components/gallery/PropertyGallery';
import { PropertyFeatures } from './components/property/PropertyFeatures';
import { LocationSection } from './components/location/LocationSection';
import { TikTokSection } from './components/tiktok/TikTokSection';
import { WhatsAppContacts } from './components/contact/WhatsAppContacts';
import { Footer } from './components/layout/Footer';
import { MobileStickyBar } from './components/layout/MobileStickyBar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { INITIAL_PROPERTY_DATA } from './data/initialData';
import { Loader2 } from 'lucide-react';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

export default function App() {
  const [property, setProperty] = useState<Property>(INITIAL_PROPERTY_DATA.property);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Load dynamic property on mount
  useEffect(() => {
    let isMounted = true;
    PropertyService.getProperty().then((data) => {
      if (isMounted) {
        setProperty(data);
        setLoading(false);
        // Track page view event
        AnalyticsService.trackEvent('page_view', {
          property_id: data.id,
          referrer: document.referrer,
        });
      }
    });

    // Listen to property updates from admin
    const handlePropertyUpdated = (e: any) => {
      if (e.detail) {
        setProperty(e.detail);
      } else {
        PropertyService.getProperty().then(setProperty);
      }
    };

    window.addEventListener('property_updated', handlePropertyUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('property_updated', handlePropertyUpdated);
    };
  }, []);

  // Smooth scroll to sections
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 transition-colors">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Chargement de l'annonce immobilière...
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-white font-sans transition-colors duration-200">
          {/* Top Header */}
          <Header property={property} onOpenAdmin={() => setIsAdminOpen(true)} />

          {/* Hero & Dominant Price Section */}
          <PriceBanner
            property={property}
            onScrollToMap={() => scrollToSection('location-section')}
            onScrollToWhatsApp={() => scrollToSection('whatsapp-contact-section')}
          />

          {/* Main Content Sections: 2 columns on desktop as specified in guide (Section 18) */}
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-12">
            {/* Section 1: Gallery & Key Details Side-by-side or stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Gallery (7 cols on desktop) */}
              <div className="lg:col-span-7">
                <PropertyGallery
                  media={property.media}
                  onOpenPhotoManager={() => setIsAdminOpen(true)}
                />
              </div>

              {/* Quick Summary & Actions on Desktop (5 cols) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/90 dark:border-neutral-800 shadow-xs space-y-5 transition-colors">
                  <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                    <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/50 px-2.5 py-1 rounded-md">
                      Opportunité Immobilière
                    </span>
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                      {PropertyService.formatPrice(property.price, property.currency)}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Superficie : <strong className="text-neutral-900 dark:text-neutral-200">{property.surface} {property.unit}</strong> • {property.city}
                    </p>
                  </div>

                  {/* Seller direct contact snippet */}
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      MK
                    </div>
                    <div className="text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400 block">Mandataire :</span>
                      <strong className="text-neutral-900 dark:text-neutral-100 text-sm">{property.seller?.name || 'Mr KAMARA'}</strong>
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      onClick={() => scrollToSection('whatsapp-contact-section')}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>💬 Échanger sur WhatsApp</span>
                    </button>

                    <button
                      onClick={() => scrollToSection('location-section')}
                      className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🗺️ Voir la carte & Localisation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Characteristics & Description */}
            <PropertyFeatures property={property} />

            {/* Section 3: Location & Map */}
            <LocationSection
              property={property}
              onOpenLocationAdmin={() => setIsAdminOpen(true)}
            />

            {/* Section 4: TikTok Showcase */}
            <TikTokSection
              media={property.media}
              onOpenAdminMedia={() => setIsAdminOpen(true)}
            />

            {/* Section 5: Dynamic WhatsApp Contacts */}
            <WhatsAppContacts
              property={property}
              onOpenContactAdmin={() => setIsAdminOpen(true)}
            />
          </main>

          {/* Sticky Mobile Contact Bar */}
          <MobileStickyBar
            property={property}
            onScrollToMap={() => scrollToSection('location-section')}
          />

          {/* Footer */}
          <Footer property={property} onOpenAdmin={() => setIsAdminOpen(true)} />

          {/* Full Admin Dashboard & Live Editor Modal */}
          {isAdminOpen && (
            <AdminDashboard
              property={property}
              onClose={() => setIsAdminOpen(false)}
              onPropertyUpdated={(updated) => setProperty(updated)}
            />
          )}
          {/* Offline Connectivity Notification */}
          <OfflineIndicator />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
