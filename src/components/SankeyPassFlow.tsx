import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { DashboardData } from '../types';
import FlipCard from './FlipCard';
import InsightBack from './InsightBack';
import { getSankeyPassFlowInsight } from './ChartInsights';
import { useOverviewInView } from '../hooks/useOverviewInView';
import { mountEcharts } from '../utils/chartResize';

echarts.use([SankeyChart, TooltipComponent, CanvasRenderer]);

export default function SankeyPassFlow({ data }: { data: DashboardData }) {
  const { ref: scrollRef, inView } = useOverviewInView();
  const chartRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);
  const insight = getSankeyPassFlowInsight(data);

  useEffect(() => {
    if (!inView || hasRendered.current || !chartRef.current) return;
    hasRendered.current = true;
        // Build Sankey: Categories -> Indicators -> Pass/Fail
    const nodes: { name: string; itemStyle?: { color: string } }[] = [];
    const links: { source: string; target: string; value: number }[] = [];

    // Category nodes
    const categories = [
      { name: 'A.学校管理与安全', color: '#4da8ff' },
      { name: 'B.办学硬件与环境', color: '#00d4ff' },
      { name: 'C.师资队伍与发展', color: '#a855f7' },
    ];

    // Top problem indicators
    const problemIndicators = data.indicators
      .filter(ind => ind.key !== '得分率' && ind.fail_count > 50)
      .sort((a, b) => b.fail_count - a.fail_count)
      .slice(0, 10);

    const shortNames: Record<string, string> = {
      'B1.1-④公共教学用房得分率': '公共教学用房',
      'B5.1-③生机比得分率': '生机比不达标',
      'C2.3-①得分率': '中高级职称不足',
      'B1.1-③专用教室面积得分率': '专用教室不足',
      'C1.1-①得分率': '教职工数不足',
      'C1.2-①得分率': '生师比不达标',
      'B2.1-②校园生活服务用房得分率': '生活用房不足',
      'C4.1-①得分率': '音体美教师不足',
      'B1.2-②生均用地面积得分率': '用地面积不足',
      'B2.1-①校园办公用房面积得分率': '办公用房不足',
    };

    // Add category nodes
    for (const cat of categories) {
      nodes.push({ name: cat.name, itemStyle: { color: cat.color } });
    }

    // Add indicator nodes
    for (const ind of problemIndicators) {
      const shortName = shortNames[ind.key] || ind.name;
      nodes.push({
        name: shortName,
        itemStyle: { color: ind.avg_rate < 0.7 ? '#ff5c5c' : ind.avg_rate < 0.85 ? '#ff9f43' : '#facc15' },
      });

      // Link from category to indicator
      const catName = ind.category || '';
      const catNode = categories.find(c => catName.includes(c.name.split('.')[0]));
      if (catNode) {
        links.push({
          source: catNode.name,
          target: shortName,
          value: ind.fail_count,
        });
      }
    }

    // Add pass/fail node
    nodes.push({ name: '⚠ 不达标学校', itemStyle: { color: '#ff5c5c' } });

    // Link indicators to pass/fail
    for (const ind of problemIndicators) {
      const shortName = shortNames[ind.key] || ind.name;
      links.push({
        source: shortName,
        target: '⚠ 不达标学校',
        value: ind.fail_count,
      });
    }

    const option: echarts.EChartsCoreOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: 'rgba(22,27,46,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e8eaed', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as { dataType: string; data: { source: string; target: string; value: number }; name: string; value: number };
          if (p.dataType === 'edge') {
            return `${p.data.source} → ${p.data.target}<br/>数量: <b>${p.data.value}</b> 所学校`;
          }
          return `${p.name}<br/>数值: <b>${p.value}</b>`;
        },
      },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: { focus: 'adjacency' },
          nodeAlign: 'left',
          layoutIterations: 0,
          data: nodes,
          links: links,
          label: {
            color: '#e8eaed',
            fontSize: 10,
            position: 'right',
          },
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
            opacity: 0.25,
          },
          nodeWidth: 16,
          nodeGap: 12,
        },
      ],
    };

    const chart = mountEcharts(chartRef.current, option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [inView, data]);

  return (
    <FlipCard
      front={
        <div ref={scrollRef} className="card-border glow-orange p-4 relative overview-chart-card">
          <span className="flip-hint" title="点击空白处翻转查看结论">⇄</span>
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="text-accent-orange">🔀</span>
            短板指标 → 不达标学校
          </h3>
          <div className="overview-chart-body">
            <div ref={chartRef} className="overview-chart-canvas" />
          </div>
          <p className="text-xs text-text-muted text-center mt-1 overview-chart-footer">
            从三大维度到底层指标，再到不达标学校数量，揭示问题传导路径
          </p>
        </div>
      }
      back={<InsightBack insight={insight} />}
    />
  );
}
