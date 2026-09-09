import React from 'react';
import { PropertyMedia } from '../../types';
import { AnalyticsService } from '../../services/analyticsService';
import { Video, ExternalLink, Play, Film } from 'lucide-react';

interface TikTokSectionProps {
  media: PropertyMedia[];
  onOpenAdminMedia?: () => void;
}

export const TikTokSection: React.FC<TikTokSectionProps> = ({ media, onOpenAdminMedia }) => {
  const tiktokVideos = media.filter((m) => m.type === 'tiktok' && m.active);

  const handleOpenTikTok = async (item: PropertyMedia) => {
    await AnalyticsService.trackEvent('tiktok_click', {
      title: item.title,
      url: item.url,
    });
    if (item.url && item.url.trim().length > 0) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (tiktokVideos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-neutral-900">🎥 Vidéos de la maison (TikTok)</h2>
        </div>
        {onOpenAdminMedia && (
          <button
            onClick={onOpenAdminMedia}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline cursor-pointer"
          >
            Gérer les vidéos
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-600">
        Découvrez la maison en vidéo interactive directement sur TikTok pour observer les volumes, l'éclairage et le quartier.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tiktokVideos.map((video, idx) => (
          <div
            key={video.id || idx}
            onClick={() => handleOpenTikTok(video)}
            className="group relative bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 shadow-md hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            {/* Background subtle accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-xs">
                  <Play className="w-3 h-3 fill-current text-rose-400 group-hover:text-emerald-400 transition-colors" />
                  TikTok Reel #{idx + 1}
                </span>
                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {video.title || 'Visite guidée en vidéo'}
              </h3>
              {video.alt_text && (
                <p className="text-xs text-neutral-400 line-clamp-2">{video.alt_text}</p>
              )}
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-medium text-neutral-300 group-hover:text-white">
              <span>▶ Voir la vidéo sur TikTok</span>
              <span className="text-neutral-500 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
