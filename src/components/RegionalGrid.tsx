import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, RadarChart, GaugeChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, RadarComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import 'echarts-gl';
import gsap from 'gsap';
import type { DashboardData } from '../types';
import FlipCard from './FlipCard';
import InsightBack from './InsightBack';
import { getRegionalGridInsight } from './ChartInsights';
import { observeChartResize } from '../utils/chartResize';
import { useEcharts } from '../hooks/useEcharts';
import { buildSideLegend, buildSideLegendGrid, sideLegendRadarCenter, sideLegendRadarRadius } from '../utils/chartLegend';

echarts.use([BarChart, LineChart, RadarChart, GaugeChart, GridComponent, TooltipComponent, LegendComponent, RadarComponent, CanvasRenderer]);

const SN: Record<string, string> = {
  'B1.1-④公共教学用房得分率': '公共教学用房', 'B5.1-③生机比得分率': '生机比',
  'C2.3-①得分率': '中高级职称', 'B1.1-③专用教室面积得分率': '专用教室面积',
  'C1.1-①得分率': '教职工数', 'C1.2-①得分率': '生师比',
  'B2.1-②校园生活服务用房得分率': '生活用房', 'C4.1-①得分率': '音体美教师',
  'B1.2-②生均用地面积得分率': '用地面积', 'B2.1-①校园办公用房面积得分率': '办公用房',
  'B5.1-②师机比得分率': '师机比', 'B7.1-①生均绿地面积得分率': '绿地面积',
  'B1.2-①生均校舍建筑面积得分率': '校舍面积', 'B3.1-①生均图书册数得分率': '图书册数',
};

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

export default function RegionalGrid({ data }: { data: DashboardData }) {
  const r1 = useRef<HTMLDivElement>(null), r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null), r4 = useRef<HTMLDivElement>(null);
  const ct = useRef<HTMLDivElement>(null);
  useEffect(() => { gsap.fromTo(ct.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }); }, []);

  const areas = ['城市', '县镇', '农村'];
  const colors = ['#f97316', '#06b6d4', '#10b981'];
  const colorsLight = ['#fb923c', '#22d3ee', '#34d399'];
  const keys = ['B1.1-④公共教学用房得分率', 'B5.1-③生机比得分率', 'C2.3-①得分率', 'B1.1-③专用教室面积得分率', 'C1.1-①得分率', 'C1.2-①得分率', 'B2.1-②校园生活服务用房得分率', 'C4.1-①得分率'];

  // C1: 城乡关键指标双轴图（竖柱+折线）
  const failCounts = keys.map(k => { const ind = data.indicators.find(i => i.key === k); return ind?.fail_count ?? 0; });
  useEcharts(r1, {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 } },
    legend: buildSideLegend([...areas, '不达标数']),
    animation: true, animationDuration: 1500, animationEasing: 'cubicOut',
    grid: buildSideLegendGrid(),
    xAxis: { type: 'category', data: keys.map(k => SN[k] || k), axisLabel: { color: '#9aa0b0', fontSize: 8, interval: 0 }, axisTick: { show: false } },
    yAxis: [
      { type: 'value', max: 1, axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: (v: number) => (v * 100).toFixed(0) + '%' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
      { type: 'value', name: '所', nameGap: 8, nameTextStyle: { color: '#9aa0b0', fontSize: 9, padding: [0, 0, 0, 0] }, axisLabel: { color: '#9aa0b0', fontSize: 9, margin: 4 }, splitLine: { show: false } },
    ],
    series: [
      ...areas.map((a, i) => ({ name: a, type: 'bar', barWidth: '28%', barGap: '8%', itemStyle: { borderRadius: [3, 3, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: colors[i] }, { offset: 1, color: colorsLight[i] }]) }, data: keys.map(k => +(data.urban_rural_analysis[a]?.[k] ?? 0).toFixed(3)) })),
      { name: '不达标数', type: 'line', yAxisIndex: 1, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#ff5c5c', width: 2, type: 'dashed' }, itemStyle: { color: '#ff5c5c' }, data: failCounts },
    ],
  });

  // C2: 3D散点图 — 城乡指标三维对比（x=城市, y=农村, z=不达标数, 自动旋转）
  const allBubbleKeys = Object.keys(SN);
  const scatter3D_Data = allBubbleKeys.map(k => {
    const cityRate = +(data.urban_rural_analysis['城市']?.[k] ?? 0).toFixed(3);
    const ruralRate = +(data.urban_rural_analysis['农村']?.[k] ?? 0).toFixed(3);
    const ind = data.indicators.find(i => i.key === k);
    const fc = ind?.fail_count ?? 0;
    return { name: SN[k] || k, value: [cityRate, ruralRate, fc, fc], cityRate, ruralRate, failCount: fc };
  }).filter(d => d.cityRate > 0 || d.ruralRate > 0);
  const s3max = Math.max(...scatter3D_Data.map(d => d.failCount), 1);
  useEcharts(r2, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1500, animationEasing: 'cubicOut',
    tooltip: { backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { name: string; data: { cityRate: number; ruralRate: number; failCount: number } }; if (!pa?.data) return ''; return `<b>${pa.name}</b><br/>城市: ${(pa.data.cityRate * 100).toFixed(1)}%<br/>农村: ${(pa.data.ruralRate * 100).toFixed(1)}%<br/>不达标: <b>${pa.data.failCount}</b> 所`; } },
    visualMap: [{
      top: 6, calculable: true, dimension: 3, min: 1, max: s3max,
      inRange: { color: ['#4ade80', '#facc15', '#ff9f43', '#ff5c5c'] },
      textStyle: { color: '#9aa0b0', fontSize: 9 },
      itemWidth: 12, itemHeight: 80,
    }],
    grid3D: {
      boxWidth: 100, boxHeight: 100, boxDepth: 100,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisPointer: { lineStyle: { color: '#ffbd67' } },
      viewControl: { autoRotate: true, autoRotateSpeed: 4, distance: 160, alpha: 0, beta: 0 },
    },
    xAxis3D: { name: '城市\n得分率', nameTextStyle: { color: '#f97316', fontSize: 10 }, type: 'value', min: 0.2, max: 1.05, axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: (v: number) => (v * 100).toFixed(0) + '%' } },
    yAxis3D: { name: '农村\n得分率', nameTextStyle: { color: '#10b981', fontSize: 10 }, type: 'value', min: 0.2, max: 1.05, axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: (v: number) => (v * 100).toFixed(0) + '%' } },
    zAxis3D: { name: '不达标\n学校数', nameTextStyle: { color: '#ff5c5c', fontSize: 10 }, type: 'value', axisLabel: { color: '#9aa0b0', fontSize: 9 } },
    series: [{
      type: 'scatter3D',
      dimensions: ['城市得分率', '农村得分率', '不达标学校数', '不达标学校数'],
      data: scatter3D_Data.map(d => ({ name: d.name, value: d.value, cityRate: d.cityRate, ruralRate: d.ruralRate, failCount: d.failCount })),
      symbolSize: 8,
      itemStyle: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
      label: { show: true, position: 'top', color: '#e8eaed', fontSize: 9, distance: 4, formatter: (p: unknown) => { const d = p as { name: string }; return d.name; } },
      emphasis: { itemStyle: { color: '#fff' }, label: { fontSize: 12, fontWeight: 'bold' } },
    }],
  });

  // C3: 三大区域六维雷达图
  const dimGroups: Record<string, string[]> = { '师资配置': ['C1.1-①得分率', 'C1.2-①得分率', 'C4.1-①得分率'], '硬件设施': ['B1.1-③专用教室面积得分率', 'B1.1-④公共教学用房得分率', 'B1.2-②生均用地面积得分率'], '信息化': ['B5.1-②师机比得分率', 'B5.1-③生机比得分率'], '校舍条件': ['B1.2-①生均校舍建筑面积得分率', 'B2.1-①校园办公用房面积得分率', 'B2.1-②校园生活服务用房得分率'], '图书绿地': ['B3.1-①生均图书册数得分率', 'B7.1-①生均绿地面积得分率'], '职称达标': ['C2.3-①得分率'], };
  const dimNames = Object.keys(dimGroups);
  useEcharts(r3, {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 } },
    legend: buildSideLegend(areas),
    animation: true, animationDuration: 1400, animationEasing: 'cubicOut',
    radar: { center: sideLegendRadarCenter, radius: sideLegendRadarRadius, indicator: dimNames.map(n => ({ name: n, max: 1 })), axisName: { color: '#9aa0b0', fontSize: 9 } },
    series: areas.map((a, i) => ({ type: 'radar' as const, name: a, data: [{ value: dimNames.map(n => { const ks = dimGroups[n]; const vs = ks.map(k => data.urban_rural_analysis[a]?.[k] ?? 0).filter(v => v > 0); return vs.length ? +(vs.reduce((x, y) => x + y, 0) / vs.length).toFixed(3) : 0; }), name: a }], symbol: 'circle', symbolSize: 5, lineStyle: { color: colors[i], width: 2 }, areaStyle: { color: colors[i] + '20' }, itemStyle: { color: colors[i] } })),
  });

  // C4: 城乡均衡指数仪表盘
  const ruralRate = data.by_urban_rural['农村']?.avg_rate ?? 0;
  const cityRate = data.by_urban_rural['城市']?.avg_rate ?? 1;
  const balanceIndex = cityRate > 0 ? +((ruralRate / cityRate) * 100).toFixed(1) : 0;
  useEcharts(r4, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1200, animationEasing: 'cubicOut',
    series: [{
      type: 'gauge', startAngle: 180, endAngle: 0, center: ['50%', '75%'], radius: '95%', min: 0, max: 100,
      axisLine: { lineStyle: { width: 6, color: [[0.25, '#FF6E76'], [0.5, '#FDDD60'], [0.75, '#58D9F9'], [1, '#7CFFB2']] } },
      pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 16, offsetCenter: [0, '-60%'], itemStyle: { color: 'auto' } },
      axisTick: { length: 10, lineStyle: { color: 'auto', width: 2 } },
      splitLine: { length: 18, lineStyle: { color: 'auto', width: 4 } },
      axisLabel: { color: '#9aa0b0', fontSize: 13, distance: -50, rotate: 'tangential', formatter: (v: number) => { if (v === 87.5) return '均衡'; if (v === 62.5) return '一般'; if (v === 37.5) return '差距'; if (v === 12.5) return '严重'; return ''; } },
      title: { offsetCenter: [0, '-10%'], color: '#9aa0b0', fontSize: 14 },
      detail: { fontSize: 26, offsetCenter: [0, '-32%'], valueAnimation: true, formatter: (v: number) => Math.round(v) + '%', color: balanceIndex >= 90 ? '#7CFFB2' : '#FDDD60' },
      data: [{ value: balanceIndex, name: '城乡均衡指数' }],
    }],
  });

  const cells = [
    { r: r2, t: '城乡指标三维对比', i: '🫧', c: '#00d4ff', delay: 'chart-appear-delay-1' },
    { r: r1, t: '城乡关键指标 · 双轴综合对比', i: '📊', c: '#4da8ff', delay: 'chart-appear-delay-2' },
    { r: r3, t: '三大区域六维', i: '🎯', c: '#f97316', delay: 'chart-appear-delay-3' },
    { r: r4, t: '城乡均衡指数', i: '⏱️', c: '#a855f7', delay: 'chart-appear-delay-4' },
  ];

  return (
    <div ref={ct} className="h-full min-h-0">
      <div className="grid grid-cols-2 h-full grid-chart-grid grid-chart-grid--fit">
        {cells.map((item, i) => {
          const cellInsight = getRegionalGridInsight(data, i);
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
