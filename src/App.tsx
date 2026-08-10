import { useState, useEffect } from 'react';
import type { AppView, GraveData, ThemeId } from './types';
import { useGitHubData } from './hooks/useGitHub';
import { LandingPage } from './pages/LandingPage';
import { ConfigPage } from './pages/ConfigPage';
import { TombstonePage } from './pages/TombstonePage';
import { CeremonyLoader } from './components/CeremonyLoader';
import { getStoredTheme, applyTheme } from './lib/themes';
import { parseShareParams } from './lib/share';
import { track } from './lib/metrics';
import { ErrorBoundary } from './components/ErrorBoundary';

const USER_RE = /^[a-zA-Z0-9-]+$/;

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [graveData, setGraveData] = useState<GraveData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme());

  const github = useGitHubData();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // ---- Deep-link: ?user=&msg=&theme= → skip config, render directly ----
  useEffect(() => {
    const params = parseShareParams(window.location.search);
    if (!params || !params.user) return;
    if (!USER_RE.test(params.user)) {
      track('deep_link_invalid');
      return;
    }
    track('deep_link_hit', { theme: params.theme });
    setTheme(params.theme);
    void startGrave(params.user, params.message, params.theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Handlers ----

  const startGrave = async (username: string, message: string, themeOverride?: ThemeId) => {
    setIsLoading(true);
    setGlobalError(null);

    const outcome = await github.fetchData(username);

    if (!outcome.ok) {
      setGlobalError(outcome.error || 'Failed to fetch GitHub data. Please try again.');
      setIsLoading(false);
      return;
    }

    // Dramatic pause
    await new Promise(resolve => setTimeout(resolve, 800));
    setGraveData(github.buildGraveData(message, themeOverride ?? theme, outcome.snapshot!));
    track('generate', { theme: themeOverride ?? theme });
    setIsLoading(false);
    setView('tombstone');
  };

  const handleStart = () => setView('config');

  const handleConfigSubmit = async ({ username, message }: { username: string; message: string }) => {
    await startGrave(username, message);
  };

  const handleReset = () => {
    setView('landing');
    setGraveData(null);
    setGlobalError(null);
    github.reset();
  };

  const handleThemeChange = (next: ThemeId) => {
    setTheme(next);
    track('theme_change', { theme: next });
  };

  // ---- Render ----

  if (isLoading) {
    return (
      <ErrorBoundary>
        <CeremonyLoader />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="antialiased">
      {globalError && (
        <div className="fixed top-0 left-0 right-0 bg-red-950 border-b border-red-800 text-red-400 font-mono text-sm px-6 py-3 z-50 flex items-center justify-between">
          <span>⚠ {globalError}</span>
          <button onClick={() => setGlobalError(null)} className="text-red-600 hover:text-red-400 ml-4">✕</button>
        </div>
      )}

      {view === 'landing' && <LandingPage onStart={handleStart} theme={theme} onThemeChange={handleThemeChange} />}
      {view === 'config' && <ConfigPage onSubmit={handleConfigSubmit} theme={theme} onThemeChange={handleThemeChange} />}
      {view === 'tombstone' && graveData && (
        <TombstonePage
          data={graveData}
          onReset={handleReset}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
      )}
      </div>
    </ErrorBoundary>
  );
}
