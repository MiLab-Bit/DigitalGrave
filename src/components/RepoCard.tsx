import type { GitHubRepo } from '../types';
import { ExternalLink, Star, GitFork, Circle } from 'lucide-react';
import { cn, formatNumber } from '../utils/helpers';

interface RepoCardProps {
  repo: GitHubRepo;
  variant?: 'magnum-opus' | 'default';
}

export function RepoCard({ repo, variant = 'default' }: RepoCardProps) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block border transition-colors duration-300',
        'hover:border-stone-600',
        variant === 'magnum-opus'
          ? 'bg-stone-900/20 border-stone-900 p-6'
          : 'bg-stone-900/10 border-stone-800 p-4'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-stone-300 font-mono text-lg group-hover:text-white transition-colors">
              {repo.name}
            </span>
            {repo.language && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] border border-stone-800 text-stone-600 rounded-full uppercase">
                <Circle size={6} className="fill-stone-600" />
                {repo.language}
              </span>
            )}
            {repo.license && (
              <span className="text-[10px] border border-stone-800 text-stone-700 rounded-full px-2 py-0.5 uppercase">
                {repo.license.spdx_id}
              </span>
            )}
          </div>

          {repo.description && (
            <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-3">
              {repo.description}
            </p>
          )}

          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {repo.topics.slice(0, 5).map(topic => (
                <span
                  key={topic}
                  className="px-2 py-0.5 bg-stone-900 text-stone-500 text-[10px] rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-stone-600 text-xs font-mono">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-stone-500" />
              {formatNumber(repo.stargazers_count)}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={12} className="text-stone-500" />
              {formatNumber(repo.forks_count)}
            </span>
          </div>
        </div>

        <ExternalLink
          size={14}
          className="text-stone-700 group-hover:text-stone-400 transition-colors mt-1 flex-shrink-0"
        />
      </div>
    </a>
  );
}