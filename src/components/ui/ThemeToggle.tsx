import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'compact', className = '' }) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-white text-amber-600 shadow-xs dark:bg-neutral-700 dark:text-amber-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          title="Activer le mode clair"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Clair</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-neutral-900 text-sky-400 shadow-xs dark:bg-neutral-700 dark:text-sky-300'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          title="Activer le mode sombre"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Sombre</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-white text-emerald-600 shadow-xs dark:bg-neutral-700 dark:text-emerald-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          title="Synchroniser avec le thème de l'appareil"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  // Compact icon button for header / navigation
  return (
    <button
      type="button"
      id="theme-toggle-button"
      onClick={toggleTheme}
      className={`p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer ${
        isDark
          ? 'bg-neutral-800 hover:bg-neutral-700 text-sky-300 border border-neutral-700/80 shadow-xs'
          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 shadow-xs'
      } ${className}`}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre pour la nuit'}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 shrink-0 animate-in spin-in-180 duration-200" />
          <span className="hidden md:inline font-semibold">Mode Clair</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-neutral-700 shrink-0 animate-in spin-in-180 duration-200" />
          <span className="hidden md:inline font-semibold">Mode Sombre</span>
        </>
      )}
    </button>
  );
};
