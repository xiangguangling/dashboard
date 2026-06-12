import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, RadarChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, RadarComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import gsap from 'gsap';
import type { DashboardData } from '../types';
import { buildSideLegend, buildSideLegendGrid, sideLegendRadarCenter, sideLegendRadarRadius } from '../utils/chartLegend';

echarts.use([BarChart, RadarChart, ScatterChart, GridComponent, TooltipComponent, LegendComponent, RadarComponent, CanvasRenderer]);

const catCIndicators = [
  { key: 'C1.1-①得分率', name: '教职工数达标', group: 'C1.编制设置' },
  { key: 'C1.2-①得分率', name: '生师比', group: 'C1.编制设置' },
  { key: 'C1.3-①得分率', name: '骨干教师数', group: 'C1.编制设置' },
  { key: 'C2.1-①得分率', name: '教师资格证', group: 'C2.学历职称' },
  { key: 'C2.2-①得分率', name: '教师学历', group: 'C2.学历职称' },
  { key: 'C2.3-①得分率', name: '中高级职称', group: 'C2.学历职称' },
  { key: 'C3.1-①得分率', name: '培训时间达标', group: 'C3.教师培训' },
  { key: 'C3.2-①得分率', name: '培训经费', group: 'C3.教师培训' },
  { key: 'C4.1-①得分率', name: '音体美教师', group: 'C4.音体美教师' },
  { key: 'C5.1-①得分率', name: '心理教师', group: 'C5.心理卫生' },
  { key: 'C5.2-①得分率', name: '校医保健', group: 'C5.心理卫生' },
  { key: 'C6.1-①得分率', name: '体育活动', group: 'C6.学生发展' },
  { key: 'C6.2-①得分率', name: '体质健康', group: 'C6.学生发展' },
];

export default function FacultyAnalysis({ data }: { data: DashboardData }) {
  const radarRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  // Radar chart: 6 subgroups
  useEffect(() => {
    if (!radarRef.current) return;
    const chart = echarts.init(radarRef.current, 'dark');

    const groups = ['C1.编制设置', 'C2.学历职称', 'C3.教师培训', 'C4.音体美教师', 'C5.心理卫生', 'C6.学生发展'];
    const schoolTypes = ['小学', '初中', '九年制'];

    const groupIndicators = groups.map(g => {
      const items = catCIndicators.filter(i => i.group === g);
      const maxVal = Math.max(
        ...schoolTypes.map(st => {
          const vals = items.map(ind => data.cross_analysis[st]?.[ind.key] ?? 0);
          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        })
      );
      return { name: g, max: Math.min(1, maxVal * 1.05) };
    });

    const option: echarts.EChartsCoreOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(22,27,46,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e8eaed', fontSize: 12 },
      },
      legend: buildSideLegend(schoolTypes, { fontSize: 11 }),
      radar: {
        center: sideLegendRadarCenter,
        radius: sideLegendRadarRadius,
        indicator: groupIndicators,
        axisName: { color: '#9aa0b0', fontSize: 10 },
      },
      series: schoolTypes.map((st, i) => {
        const colors = ['#4da8ff', '#00d4ff', '#a855f7'];
        return {
          type: 'radar',
          name: st,
          data: [{
            value: groups.map(g => {
              const items = catCIndicators.filter(ind => ind.group === g);
              const vals = items.map(ind => data.cross_analysis[st]?.[ind.key] ?? 0);
              return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3) : 0;
            }),
            name: st,
          }],
          symbol: ['circle', 'diamond', 'triangle'][i],
          symbolSize: 5,
          lineStyle: { color: colors[i], width: 2 },
          areaStyle: { color: colors[i] + '20' },
          itemStyle: { color: colors[i] },
        };
      }),
    };

    chart.setOption(option);
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [data]);

  // Bar chart: Detailed indicators
  useEffect(() => {
    if (!barRef.current) return;
    const chart = echarts.init(barRef.current, 'dark');

    const schoolTypes = ['小学', '初中', '九年制'];
    const colors = ['#f97316', '#06b6d4', '#10b981'];
    const colorsLight = ['#fb923c', '#22d3ee', '#34d399'];

    const option: echarts.EChartsCoreOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22,27,46,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e8eaed', fontSize: 11 },
        formatter: (params: unknown) => {
          const p = params as { seriesName: string; value: number; axisValue: string }[];
          if (!p?.length) return '';
          return `<b>${p[0].axisValue}</b><br/>` +
            p.map(item => `${item.seriesName}: <b>${(item.value * 100).toFixed(1)}%</b>`).join('<br/>');
        },
      },
      legend: buildSideLegend(schoolTypes, { fontSize: 11 }),
      grid: buildSideLegendGrid(),
      xAxis: {
        type: 'category',
        data: catCIndicators.map(i => i.name),
        axisLabel: { color: '#9aa0b0', fontSize: 9, interval: 0 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 0.6,
        max: 1,
        axisLabel: { color: '#9aa0b0', fontSize: 10, formatter: (v: number) => (v * 100).toFixed(0) + '%' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      series: schoolTypes.map((st, i) => ({
        name: st,
        type: 'bar',
        barWidth: '28%',
        barGap: '8%',
        itemStyle: { borderRadius: [3, 3, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: colors[i] }, { offset: 1, color: colorsLight[i] }]) },
        data: catCIndicators.map(ind => {
          const val = data.cross_analysis[st]?.[ind.key] ?? 0;
          return +val.toFixed(3);
        }),
      })),
    };

    chart.setOption(option);
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [data]);

  // Key insights
  const worstCatC = data.indicators
    .filter(i => i.category?.includes('C类'))
    .sort((a, b) => a.avg_rate - b.avg_rate)
    .slice(0, 4);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {worstCatC.map((ind, i) => {
          const colors = ['#ff5c5c', '#ff9f43', '#facc15', '#4ade80'];
          return (
            <div key={i} className="card-border p-4" style={{ borderTop: `3px solid ${colors[i]}` }}>
              <div className="text-xs text-text-muted mb-1">{ind.name}</div>
              <div className="text-2xl font-bold" style={{ color: colors[i] }}>
                {(ind.avg_rate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-text-secondary mt-1">
                不达标 {ind.fail_count} 所 ({ind.fail_pct}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Key finding */}
      <div className="card-border p-4 border-l-4" style={{ borderLeftColor: '#a855f7' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">👩‍🏫</span>
          <div>
            <h3 className="text-sm font-bold text-accent-purple mb-1">师资队伍维度核心发现</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li><b>初中</b>在师资维度表现最弱（得分率92.0%），显著低于小学（93.9%）和九年制（93.9%）</li>
              <li><b>中高级职称教师比例</b>是最大短板（76.8%），198所学校未达标</li>
              <li><b>教职工编制不足</b>和<b>生师比偏高</b>是普遍问题，分别有133所和126所未达标</li>
              <li>教师培训和培训经费两项指标<b>100%达标</b>，说明培训机制运行良好</li>
              <li>学生体育活动和体质健康测试达标率接近100%，学生发展指标表现优秀</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Radar chart */}
      <div className="card-border glow-purple p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-accent-purple">🎯</span>
          师资队伍六大子维度
        </h3>
        <div ref={radarRef} style={{ width: '100%', height: '400px' }} />
      </div>

      {/* Detail bar chart */}
      <div className="card-border glow-blue p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-accent-blue">📊</span>
          师资队伍13项指标 · 三类学校得分率详细对比
        </h3>
        <div ref={barRef} style={{ width: '100%', height: '380px' }} />
      </div>
    </div>
  );
}
