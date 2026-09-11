import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, Monitor, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'prominent' | 'footer';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isWindows, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running in standalone PWA mode, don't show the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setShowModal(false), 2000);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Button Renderers based on variant */}
      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Installer l'application sur votre appareil (Windows, Android, iOS)"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
          <span>Installer l'app</span>
        </button>
      )}

      {variant === 'prominent' && (
        <button
          onClick={handleInstallClick}
          className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Download className="w-4 h-4" />
          <span>Installer l'application PWA (Accès rapide)</span>
        </button>
      )}

      {variant === 'footer' && (
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Installer sur Windows, Android ou iOS</span>
        </button>
      )}

      {/* Comprehensive Guided Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-neutral-100 text-neutral-900 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                  Installer l'application PWA
                </h3>
                <p className="text-xs text-neutral-500">
                  Accès hors-ligne, fluide et instantané comme une application native.
                </p>
              </div>
            </div>

            {/* Direct install trigger if browser event is ready */}
            {isInstallable && !installSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <p className="text-xs font-semibold text-emerald-900 mb-3">
                  Votre navigateur est prêt pour l'installation directe en 1 clic :
                </p>
                <button
                  onClick={async () => {
                    const res = await install();
                    if (res) setInstallSuccess(true);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Installer maintenant</span>
                </button>
              </div>
            )}

            {installSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Application installée avec succès sur votre appareil !</span>
              </div>
            )}

            {/* OS Specific Guides */}
            <div className="space-y-4 text-xs">
              {/* Android Guide */}
              <div className={`p-4 rounded-2xl border transition-colors ${isAndroid ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-center gap-2 font-bold text-neutral-900 mb-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Sur Android (Chrome, Samsung Internet, Edge)</span>
                  {isAndroid && <span className="text-2xs bg-emerald-600 text-white px-2 py-0.5 rounded-full ml-auto">Votre appareil</span>}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-600 leading-relaxed pl-1">
                  <li>Appuyez sur le menu <strong className="text-neutral-800">⋮</strong> (les 3 petits points en haut à droite).</li>
                  <li>Sélectionnez <strong className="text-neutral-800">« Installer l'application »</strong> ou <strong className="text-neutral-800">« Ajouter à l'écran d'accueil »</strong>.</li>
                  <li>Confirmez : l'icône apparaît sur votre écran d'accueil comme une application Play Store.</li>
                </ol>
              </div>

              {/* iOS / iPhone Guide */}
              <div className={`p-4 rounded-2xl border transition-colors ${isIOS ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-center gap-2 font-bold text-neutral-900 mb-2">
                  <Share className="w-4 h-4 text-sky-600" />
                  <span>Sur iPhone & iPad (Safari)</span>
                  {isIOS && <span className="text-2xs bg-emerald-600 text-white px-2 py-0.5 rounded-full ml-auto">Votre appareil</span>}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-600 leading-relaxed pl-1">
                  <li>Ouvrez ce site dans le navigateur <strong className="text-neutral-800">Safari</strong>.</li>
                  <li>Appuyez sur le bouton de partage <strong className="text-neutral-800 inline-flex items-center gap-0.5"><Share className="w-3 h-3 text-sky-600 inline" /> Partager</strong> (en bas de l'écran).</li>
                  <li>Faites défiler vers le bas et touchez <strong className="text-neutral-800 inline-flex items-center gap-0.5"><PlusSquare className="w-3 h-3 text-neutral-700 inline" /> « Sur l'écran d'accueil »</strong>.</li>
                  <li>Touchez <strong className="text-neutral-800">« Ajouter »</strong> en haut à droite.</li>
                </ol>
              </div>

              {/* Windows / PC Guide */}
              <div className={`p-4 rounded-2xl border transition-colors ${isWindows ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-center gap-2 font-bold text-neutral-900 mb-2">
                  <Monitor className="w-4 h-4 text-violet-600" />
                  <span>Sur Windows & Mac (Chrome, Edge)</span>
                  {isWindows && <span className="text-2xs bg-emerald-600 text-white px-2 py-0.5 rounded-full ml-auto">Votre ordinateur</span>}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-600 leading-relaxed pl-1">
                  <li>Dans la barre d'adresse de votre navigateur, cliquez sur l'icône <strong className="text-neutral-800">Installer</strong> (petite icône d'ordinateur avec flèche).</li>
                  <li>Ou ouvrez le menu du navigateur et cliquez sur <strong className="text-neutral-800">« Installer Maison 600m² »</strong>.</li>
                  <li>L'application s'ouvre dans sa propre fenêtre indépendante sur votre bureau.</li>
                </ol>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
