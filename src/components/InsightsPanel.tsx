import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { DashboardData } from '../types';

export default function InsightsPanel({ data }: { data: DashboardData }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll('.insight-item');
    gsap.fromTo(items,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.5,
      }
    );
  }, []);

  const insights = [
    {
      icon: '🔴',
      color: '#ff5c5c',
      title: '公共教学用房严重不足',
      desc: `52.2%的学校（${Math.round(data.overall.total_schools * 0.522)}所）未达标，是全部44项指标中得分率最低（47.8%）的致命短板。图书馆、心理健康辅导室、体育活动室等公共空间配置亟待加强。`,
    },
    {
      icon: '⚠️',
      color: '#ff9f43',
      title: '信息化终端配比失衡',
      desc: '生机比达标率仅65.1%，超过三分之一学校学生终端设备不足。师机比同样仅91.2%，信息化基础设施与"教育数字化"目标存在明显差距。',
    },
    {
      icon: '📊',
      color: '#facc15',
      title: '师资结构性矛盾突出',
      desc: `中高级职称教师比例达标率仅76.8%，音体美专任教师达标率86.9%，教职工编制达标率84.4%。师资队伍"量不足、质不优"问题在小学阶段尤为突出。`,
    },
    {
      icon: '💡',
      color: '#00d4ff',
      title: '九年制学校表现最优',
      desc: `九年制学校平均得分41.94分（满分44），高于初中（41.54分）和小学（41.29分）。九年制学校在资源整合与规模效应上具有明显优势，可作为标准化建设标杆。`,
    },
    {
      icon: '✅',
      color: '#00e396',
      title: '安全与卫生基本达标',
      desc: '校园安全、卫生保健、饮用水、厕所卫生、危房排查等11项指标得分率均在97%以上，表明学校在基础安全管理和卫生保障方面整体表现优秀。',
    },
  ];

  return (
    <div ref={ref} className="card-border glow-blue p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center justify-center gap-2">
        <span>🔍</span>
        数据洞察 · 关键发现
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((item, i) => (
          <div
            key={i}
            className="insight-item bg-bg-secondary rounded-xl p-4 border border-border-subtle hover:border-opacity-30 transition-all duration-300"
            style={{ borderColor: item.color + '20' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{item.icon}</span>
              <h4 className="text-xs font-semibold" style={{ color: item.color }}>
                {item.title}
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
