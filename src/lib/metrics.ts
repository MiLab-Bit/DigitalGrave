import type { ThemeId } from '../types';

/**
 * Lightweight local metrics layer (P1-5).
 * No backend: events are appended to localStorage and mirrored to console.
 * Once an analytics endpoint exists, forward `events` there.
 */

const KEY = 'dg_metrics';
const MAX = 500;

export type MetricEvent =
  | 'generate'
  | 'share_link'
  | 'share_native'
  | 'export_png'
  | 'theme_change'
  | 'copy_ipfs'
  | 'badge_copy'
  | 'heatmap_view'
  | 'deep_link_hit'
  | 'deep_link_invalid';

interface MetricRecord {
  t: number;
  e: MetricEvent;
  p?: Record<string, string | number>;
}

export function track(event: MetricEvent, props?: Record<string, string | number>): void {
  const record: MetricRecord = { t: Date.now(), e: event, p: props };
  // eslint-disable-next-line no-console
  console.debug('[metric]', event, props ?? '');
  try {
    const raw = localStorage.getItem(KEY);
    const list: MetricRecord[] = raw ? JSON.parse(raw) : [];
    list.push(record);
    if (list.length > MAX) list.splice(0, list.length - MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable -> metrics best-effort */
  }
}

export function getMetrics(): MetricRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MetricRecord[]) : [];
  } catch {
    return [];
  }
}

export function metricTheme(theme: ThemeId): Record<string, string | number> {
  return { theme };
}
