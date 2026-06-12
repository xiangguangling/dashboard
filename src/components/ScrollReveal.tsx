import { useInView } from '../hooks/useInView';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** 动画延迟，单位ms */
  delay?: number;
  /** 动画方向：up | left | right | fade */
  direction?: 'up' | 'left' | 'right' | 'fade';
  threshold?: number;
}

const directionMap = {
  up: 'reveal-up',
  left: 'reveal-left',
  right: 'reveal-right',
  fade: 'reveal-fade',
};

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold,
}: ScrollRevealProps) {
  const { ref, inView } = useInView({ threshold });

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${directionMap[direction]} ${inView ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
