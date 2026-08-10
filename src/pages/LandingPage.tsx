import { Terminal, Cpu } from 'lucide-react';
import type { ThemeId } from '../types';
import { ThemePicker } from '../components/ThemePicker';

interface LandingPageProps {
  onStart: () => void;
  theme: ThemeId;
  onThemeChange: (next: ThemeId) => void;
}

const EPITAPH = '"在比特的海洋里，我们将如同法老一般，将我们的思维固化在提交记录的金字塔中。当肉体消逝，git log 将是我们唯一的呼吸。"';

export function LandingPage({ onStart, theme, onThemeChange }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--dg-bg)] text-[var(--dg-fg)] font-mono flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 text-center animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Cpu size={64} className="text-[var(--dg-muted)] animate-pulse-slow" />
          </div>
        </div>

        <div>
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-[var(--dg-fg)]"
            style={{ textShadow: '2px 0 var(--dg-accent), -2px 0 var(--dg-accent)' }}
          >
            DIGITAL GRAVE
          </h1>
          <p className="text-xl text-[var(--dg-muted)] mt-4">
            你的 GitHub，是你的数字墓碑。
          </p>
        </div>

        <div className="border-l-2 border-[var(--dg-edge)] pl-6 text-left py-4 my-8 bg-[var(--dg-surface)]/30">
          <p className="italic text-[var(--dg-muted)] leading-relaxed">{EPITAPH}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-xs text-[var(--dg-faint)] uppercase tracking-widest">
          <span className="border border-[var(--dg-edge)] px-3 py-1 rounded-full">GitHub Integration</span>
          <span className="border border-[var(--dg-edge)] px-3 py-1 rounded-full">IPFS Archive</span>
          <span className="border border-[var(--dg-edge)] px-3 py-1 rounded-full">Digital Legacy</span>
        </div>

        <div className="pt-4">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-[var(--dg-fg)] transition duration-300 ease-out border-2 border-[var(--dg-fg)] hover:bg-[var(--dg-fg)] hover:text-[var(--dg-bg)]"
          >
            <span className="absolute inset-0 flex items-center justify-center w-full h-full text-[var(--dg-fg)] duration-300 -translate-x-full bg-[var(--dg-bg)] group-hover:translate-x-0 ease">
              <Terminal size={20} />
            </span>
            <span className="absolute flex items-center justify-center w-full h-full text-[var(--dg-fg)] transition-all duration-300 transform group-hover:translate-x-full ease">
              初始化遗嘱
            </span>
            <span className="relative invisible">初始化遗嘱</span>
          </button>
        </div>

        <div className="pt-8 text-center">
          <p className="text-[var(--dg-faint)] text-xs">
            Built with grief and TypeScript ·{' '}
            <a
              href="https://github.com/MiLab-Bit/DigitalGrave"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--dg-muted)] hover:text-[var(--dg-accent)] transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>

      <ThemePicker theme={theme} onThemeChange={onThemeChange} />
    </div>
  );
}
