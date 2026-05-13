import { cn } from '../utils/helpers';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between mb-1 text-xs font-mono text-gray-500 uppercase tracking-widest">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-1 bg-zinc-800 w-full overflow-hidden rounded">
        <div
          className="h-full bg-white transition-all duration-500 ease-out rounded"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}