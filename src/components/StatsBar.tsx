import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { DashboardData } from '../types';

export default function StatsBar({ data }: { data: DashboardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const { overall } = data;

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current.children,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  const stats = [
    { label: '监测学校', value: overall.total_schools, suffix: '所', color: '#4da8ff' },
    { label: '平均总分', value: overall.avg_score.toFixed(1), suffix: '/44', color: '#00d4ff' },
    { label: '得分率', value: (overall.avg_rate * 100).toFixed(1), suffix: '%', color: '#00e396' },
    { label: '满分学校', value: overall.schools_full_score, suffix: '所', color: '#facc15' },
    { label: '≥40分', value: ((overall.schools_above_40 / overall.total_schools) * 100).toFixed(0), suffix: '%', color: '#a855f7' },
    { label: '最低分', value: overall.min_score, suffix: '分', color: '#ff9f43' },
  ];

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-border-subtle bg-bg-secondary/50">
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-text-muted">{s.label}</span>
          <span className="font-bold text-text-primary" style={{ color: s.color }}>
            {s.value}{s.suffix}
          </span>
          {i < stats.length - 1 && <span className="text-text-muted/30 mx-1">|</span>}
        </div>
      ))}
    </div>
  );
}
