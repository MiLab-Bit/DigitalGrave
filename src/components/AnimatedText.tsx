import { useEffect, useState } from 'react';
import type { AnimatedTextProps } from '../types';
import { cn } from '../utils/helpers';

export function AnimatedText({ text, variant = 'fade', speed = 50, className }: AnimatedTextProps) {
  const [displayed, setDisplayed] = useState(variant === 'typewriter' ? '' : text);

  useEffect(() => {
    if (variant === 'typewriter') {
      setDisplayed('');
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    } else {
      setDisplayed(text);
    }
  }, [text, variant, speed]);

  if (variant === 'typewriter') {
    return (
      <span className={cn('font-mono', className)}>
        {displayed}
        <span className="animate-pulse">|</span>
      </span>
    );
  }

  if (variant === 'glitch') {
    return (
      <span
        className={cn('animate-glitch', className)}
        style={{ textShadow: '2px 0 #ff0000, -2px 0 #00ff00' }}
      >
        {displayed}
      </span>
    );
  }

  return <span className={cn('animate-fade-in', className)}>{displayed}</span>;
}