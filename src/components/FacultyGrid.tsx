import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, RadarChart, LineChart, HeatmapChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, RadarComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import 'echarts-gl';
import gsap from 'gsap';
import type { DashboardData } from '../types';
import FlipCard from './FlipCard';
import InsightBack from './InsightBack';
import { getFacultyGridInsight } from './ChartInsights';
import { observeChartResize } from '../utils/chartResize';
import { useEcharts } from '../hooks/useEcharts';
import { buildHeatmapVisualMap, buildHeatmapLabelStyle } from '../utils/heatmapVisualMap';
import { buildSideLegend, buildSideLegendGrid, sideLegendRadarCenter, sideLegendRadarRadius } from '../utils/chartLegend';

echarts.use([BarChart, RadarChart, LineChart, HeatmapChart, ScatterChart, GridComponent, TooltipComponent, LegendComponent, RadarComponent, VisualMapComponent, CanvasRenderer]);

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

function Cell({ t, i, c, p, appearClass, children }: { t: string; i: string; c: string; p?: string; appearClass?: string; children: React.ReactNode }) {
  return (
    <div className={`card-border chart-panel p-3 flex flex-col relative h-full${appearClass ? ` ${appearClass}` : ""}`} style={{ minHeight: 0 }}>
      <span className="flip-hint" title="点击空白处翻转查看结论">⇄</span>
      <h3 className="text-xs font-semibold text-text-primary mb-1.5 flex items-center justify-center gap-1.5 flex-shrink-0 pr-6">
        <span style={{ color: c }}>{i}</span><span className="text-center">{t}</span>
      </h3>
      <div className="flex-1 relative" style={{ minHeight: 0 }}>{children}</div>
      {p && <p className="text-[10px] text-text-muted text-center mt-1 flex-shrink-0">{p}</p>}
    </div>
  );
}
export default function FacultyGrid({ data }: { data: DashboardData }) {
  const r1 = useRef<HTMLDivElement>(null), r2 = useRef<HTMLDivElement>(null), r3 = useRef<HTMLDivElement>(null), r4 = useRef<HTMLDivElement>(null);
  const ct = useRef<HTMLDivElement>(null);
  useEffect(() => { gsap.fromTo(ct.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }); }, []);

  const stypes = ['小学', '初中', '九年制'];
  const scolors = ['#4da8ff', '#00d4ff', '#a855f7'];
  const barColors = ['#f97316', '#06b6d4', '#10b981'];
  const barColorsLight = ['#fb923c', '#22d3ee', '#34d399'];

  // C1: 六大子维度雷达图
  const groups = ['C1.编制设置', 'C2.学历职称', 'C3.教师培训', 'C4.音体美教师', 'C5.心理卫生', 'C6.学生发展'];
  const groupMax = Math.max(...stypes.map(st => Math.max(...groups.map(g => { const items = catCIndicators.filter(ind => ind.group === g); const vals = items.map(ind => data.cross_analysis[st]?.[ind.key] ?? 0); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0; }))));
  useEcharts(r1, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1400, animationEasing: 'cubicOut',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 } },
    legend: buildSideLegend(stypes),
    radar: { center: sideLegendRadarCenter, radius: sideLegendRadarRadius, indicator: groups.map(g => ({ name: g.replace('C', '').replace('.', ' '), max: Math.min(1, groupMax * 1.05) })), axisName: { color: '#9aa0b0', fontSize: 9 } },
    series: stypes.map((st, i) => ({ type: 'radar' as const, name: st, data: [{ value: groups.map(g => { const items = catCIndicators.filter(ind => ind.group === g); const vals = items.map(ind => data.cross_analysis[st]?.[ind.key] ?? 0); return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3) : 0; }), name: st }], symbol: ['circle', 'diamond', 'triangle'][i], symbolSize: 4, lineStyle: { color: scolors[i], width: 2 }, areaStyle: { color: scolors[i] + '20' }, itemStyle: { color: scolors[i] } })),
  });

  // C2: 六维度×三类学校热力图
  const dimNames = ['编制设置', '学历职称', '教师培训', '音体美教师', '心理卫生', '学生发展'];
  const heatCData: [number, number, number][] = [];
  dimNames.forEach((_, di) => {
    const g = groups[di];
    const items = catCIndicators.filter(ind => ind.group === g);
    stypes.forEach((st, si) => {
      const vals = items.map(ind => data.cross_analysis[st]?.[ind.key] ?? 0).filter(v => v > 0);
      const avg = vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length * 100).toFixed(1) : 0;
      heatCData.push([di, si, avg]);
    });
  });
  useEcharts(r2, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1000,
    tooltip: { backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { value: [number, number, number] }; return `<b>${dimNames[pa.value[0]]} · ${stypes[pa.value[1]]}</b><br/>得分率: <b>${pa.value[2]}%</b>`; } },
    grid: buildSideLegendGrid({ left: "8%", top: "6%" }),
    xAxis: { type: 'category', data: dimNames, axisLabel: { color: '#9aa0b0', fontSize: 9 }, axisTick: { show: false }, position: 'top' },
    yAxis: { type: 'category', data: stypes, axisLabel: { color: '#e8eaed', fontSize: 11 }, axisTick: { show: false } },
    visualMap: buildHeatmapVisualMap(heatCData, { orient: 'vertical', right: 0, top: 'center' }),
    series: [{ type: 'heatmap', data: heatCData, label: buildHeatmapLabelStyle(10), emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(168,85,247,0.5)' } }, itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: 'rgba(10,14,26,0.8)' } }],
  });

  // C3: 师资指标棒棒糖图（横线+圆点 — 从大到小排列，颜色=等级）
  const lollipopData = catCIndicators.map(ind => { const f = data.indicators.find(i => i.key === ind.key); return { name: ind.name, value: f ? +(f.avg_rate * 100).toFixed(1) : 0, fail: f?.fail_count ?? 0 }; }).sort((a, b) => b.value - a.value);
  useEcharts(r3, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1400, animationEasing: 'cubicOut',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { name: string; value: number }[]; if (!pa?.length) return ''; return `<b>${pa[0].name}</b><br/>得分率: <b>${pa[0].value}%</b>`; } },
    grid: { left: '3%', right: '10%', top: '3%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', min: 60, max: 105, axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: '{value}%' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    yAxis: { type: 'category', data: lollipopData.map(d => d.name).reverse(), axisLabel: { color: '#9aa0b0', fontSize: 9 }, axisLine: { show: false }, axisTick: { show: false }, inverse: true },
    series: [
      {
        type: 'bar', barWidth: 3,
        data: lollipopData.reverse().map(d => ({ value: d.value, itemStyle: { color: '#3a4a6a' } })),
        z: 0,
      },
      {
        type: 'scatter', symbolSize: 16,
        data: lollipopData.map(d => ({
          value: d.value,
          itemStyle: { color: d.value >= 95 ? '#4ade80' : d.value >= 85 ? '#facc15' : d.value >= 75 ? '#ff9f43' : '#ff5c5c', borderColor: '#0a0e1a', borderWidth: 2 },
        })),
        label: { show: true, position: 'right', color: '#e8eaed', fontSize: 10, fontWeight: 'bold', formatter: '{c}%' },
        z: 10,
      },
    ],
  });

  // C4: 3D散点图 — 师资指标三维分析（x=得分率, y=不达标数, z=不达标比例, 自动旋转）
  const cAllInds = data.indicators.filter(i => i.category?.includes('C类') && i.key !== '得分率' && i.fail_count > 0);
  const cMaxFail = Math.max(...cAllInds.map(i => i.fail_count), 1);
  const c3DData = cAllInds.map(ind => ({ name: ind.name, value: [+(ind.avg_rate).toFixed(3), ind.fail_count, +(ind.fail_pct).toFixed(1), ind.fail_count], rate: ind.avg_rate, fail: ind.fail_count }));
  useEcharts(r4, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1500, animationEasing: 'cubicOut',
    tooltip: { backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { name: string; data: { rate: number; fail: number } }; if (!pa?.data) return ''; return `<b>${pa.name}</b><br/>得分率: ${(pa.data.rate * 100).toFixed(1)}%<br/>不达标: <b>${pa.data.fail}</b> 所`; } },
    visualMap: [{
      top: 6, calculable: true, dimension: 3, min: 1, max: cMaxFail,
      inRange: { color: ['#4ade80', '#facc15', '#ff9f43', '#ff5c5c'] },
      textStyle: { color: '#9aa0b0', fontSize: 9 },
      itemWidth: 12, itemHeight: 80,
    }],
    grid3D: {
      boxWidth: 100, boxHeight: 100, boxDepth: 100,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisPointer: { lineStyle: { color: '#ffbd67' } },
      viewControl: { autoRotate: true, autoRotateSpeed: 5, distance: 160, alpha: 0, beta: 0 },
    },
    xAxis3D: { name: '得分率', nameTextStyle: { color: '#4ade80', fontSize: 10 }, type: 'value', min: 0.6, max: 1.05, axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: (v: number) => (v * 100).toFixed(0) + '%' } },
    yAxis3D: { name: '不达标\n学校数', nameTextStyle: { color: '#ff5c5c', fontSize: 10 }, type: 'value', axisLabel: { color: '#9aa0b0', fontSize: 9 } },
    zAxis3D: { name: '不达标\n比例(%)', nameTextStyle: { color: '#ff9f43', fontSize: 10 }, type: 'value', axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: '{value}%' } },
    series: [{
      type: 'scatter3D',
      dimensions: ['得分率', '不达标学校数', '不达标比例', '不达标学校数'],
      data: c3DData.map(d => ({ name: d.name, value: d.value, rate: d.rate, fail: d.fail })),
      symbolSize: 8,
      itemStyle: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
      label: { show: true, position: 'top', color: '#e8eaed', fontSize: 9, distance: 4, formatter: (p: unknown) => { const d = p as { name: string }; return d.name; } },
      emphasis: { itemStyle: { color: '#fff' }, label: { fontSize: 12, fontWeight: 'bold' } },
    }],
  });

  const cells = [
    { r: r4, t: '师资指标三维分析', i: '🫧', c: '#00d4ff', delay: 'chart-appear-delay-1' },
    { r: r2, t: '六维度×三类学校', i: '🔥', c: '#4da8ff', delay: 'chart-appear-delay-2' },
    { r: r1, t: '师资六维度', i: '🎯', c: '#a855f7', delay: 'chart-appear-delay-3' },
    { r: r3, t: '得分率排序', i: '🍭', c: '#a855f7', delay: 'chart-appear-delay-4' },
  ];

  return (
    <div ref={ct} className="h-full min-h-0">
      <div className="grid grid-cols-2 h-full grid-chart-grid grid-chart-grid--fit">
        {cells.map((item, i) => {
          const cellInsight = getFacultyGridInsight(data, i);
          return (
            <FlipCard
              key={i}
              front={
                <Cell t={item.t} i={item.i} c={item.c} appearClass={`chart-appear ${item.delay}`}>
                  <div ref={item.r} className="chart-embed-canvas" />
                </Cell>
              }
              back={<InsightBack insight={cellInsight} />}
            />
          );
        })}
      </div>
    </div>
  );
}
