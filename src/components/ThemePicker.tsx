import type { ThemeId } from '../types';
import { THEMES } from '../lib/themes';

interface ThemePickerProps {
  theme: ThemeId;
  onThemeChange: (next: ThemeId) => void;
}

export function ThemePicker({ theme, onThemeChange }: ThemePickerProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-[var(--dg-surface)]/80 backdrop-blur border border-[var(--dg-edge)] rounded-full px-3 py-2">
      <span className="text-[var(--dg-faint)] text-[10px] uppercase tracking-widest mr-1 hidden sm:inline">
        Theme
      </span>
      <div className="flex items-center gap-1.5">
        {THEMES.map(t => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-label={t.label}
            aria-pressed={theme === t.id}
            onClick={() => onThemeChange(t.id)}
            className={`w-5 h-5 rounded-full border transition-transform ${
              theme === t.id
                ? 'border-[var(--dg-accent)] scale-110'
                : 'border-[var(--dg-edge)] hover:scale-110'
            }`}
            style={{ backgroundColor: t.swatch }}
          />
        ))}
      </div>
    </div>
  );
}
