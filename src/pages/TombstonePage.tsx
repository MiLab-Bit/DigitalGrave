import type { GraveData, ThemeId } from '../types';
import { TombstoneCard } from '../components/TombstoneCard';
import { ThemePicker } from '../components/ThemePicker';
import { Github } from 'lucide-react';

interface TombstonePageProps {
  data: GraveData;
  onReset: () => void;
  theme: ThemeId;
  onThemeChange: (next: ThemeId) => void;
}

export function TombstonePage({ data, onReset, theme, onThemeChange }: TombstonePageProps) {
  return (
    <div className="antialiased">
      {/* GitHub Attribution */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href={data.user?.html_url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-[var(--dg-surface)] backdrop-blur border border-[var(--dg-edge)] text-[var(--dg-muted)] hover:text-[var(--dg-fg)] text-xs font-mono transition-colors rounded"
        >
          <Github size={12} />
          View on GitHub
        </a>
      </div>

      <TombstoneCard data={data} onReset={onReset} />

      <ThemePicker theme={theme} onThemeChange={onThemeChange} />
    </div>
  );
}
