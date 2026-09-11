import React, { useState } from 'react';
import { PropertyMedia } from '../../types';
import { AnalyticsService } from '../../services/analyticsService';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Image as ImageIcon,
  Camera,
  Star,
  PlusCircle,
} from 'lucide-react';

interface PropertyGalleryProps {
  media: PropertyMedia[];
  onOpenPhotoManager: () => void;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ media, onOpenPhotoManager }) => {
  const images = media.filter((m) => m.type === 'image' && m.active);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentImage = images[selectedIdx] || images[0];

  const handleOpenLightbox = (index: number) => {
    setSelectedIdx(index);
    setLightboxOpen(true);
    AnalyticsService.trackEvent('gallery_view', {
      photo_id: images[index]?.id,
      index,
    });
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-3xl p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-800 transition-colors">
        <ImageIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">Aucune photo enregistrée</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
          Vous pouvez ajouter les vraies photos de la maison dès maintenant.
        </p>
        <button
          onClick={onOpenPhotoManager}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          Ajouter les photos du bien
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar of gallery */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Galerie photos ({images.length})</h2>
        </div>
        <button
          onClick={onOpenPhotoManager}
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Uploader de nouvelles photos"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Gérer / Ajouter photos</span>
        </button>
      </div>

      {/* Main Feature Photo */}
      <div
        className="relative group rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 aspect-16/10 sm:aspect-16/9 cursor-pointer shadow-md border border-neutral-200 dark:border-neutral-800"
        onClick={() => handleOpenLightbox(selectedIdx)}
      >
        <img
          src={currentImage?.url}
          alt={currentImage?.alt_text || currentImage?.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          loading="eager"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

        {/* Badges on main photo */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {currentImage?.featured && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-md">
              <Star className="w-3 h-3 fill-current" />
              Photo principale
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-md">
            {selectedIdx + 1} / {images.length}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenLightbox(selectedIdx);
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
          title="Plein écran"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Captions */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="text-white text-base sm:text-lg font-bold drop-shadow-md">
              {currentImage?.title || 'Vue de la maison'}
            </h3>
            {currentImage?.alt_text && (
              <p className="text-neutral-200 text-xs sm:text-sm drop-shadow-xs line-clamp-1">
                {currentImage.alt_text}
              </p>
            )}
          </div>
          <span className="text-xs text-neutral-300 hidden sm:inline-block bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
            Cliquer pour agrandir
          </span>
        </div>

        {/* Left & Right arrow controls on main view */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-neutral-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-neutral-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              aria-label="Photo suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIdx(idx)}
                className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-400/40 scale-102 shadow-sm'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || img.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {img.featured && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full">
            <div>
              <p className="font-bold text-sm sm:text-base">{currentImage?.title}</p>
              <p className="text-xs text-neutral-400">
                Photo {selectedIdx + 1} sur {images.length}
              </p>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Image with navigation */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage?.url}
              alt={currentImage?.alt_text}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all"
                  aria-label="Suivant"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div
            className="max-w-3xl mx-auto w-full flex items-center justify-center gap-2 overflow-x-auto pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  idx === selectedIdx ? 'border-emerald-400 scale-110' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
