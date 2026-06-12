import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, TreemapChart, HeatmapChart, BoxplotChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import 'echarts-gl';
import gsap from 'gsap';
import type { DashboardData } from '../types';
import FlipCard from './FlipCard';
import InsightBack from './InsightBack';
import { getFacilityGridInsight } from './ChartInsights';
import { observeChartResize } from '../utils/chartResize';
import { useEcharts } from '../hooks/useEcharts';
import { buildHeatmapVisualMap, buildHeatmapLabelStyle } from '../utils/heatmapVisualMap';
import { buildSideLegendGrid } from '../utils/chartLegend';

echarts.use([BarChart, TreemapChart, HeatmapChart, BoxplotChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, CanvasRenderer]);

const catBGroups: Record<string, { name: string; keys: string[] }> = {
  'B1.教学用房': { name: '教学用房(6分)', keys: ['B1.1-①得分率', 'B1.1-②普通教室数得分率', 'B1.1-③专用教室面积得分率', 'B1.1-④公共教学用房得分率', 'B1.2-①生均校舍建筑面积得分率', 'B1.2-②生均用地面积得分率'] },
  'B2.办公生活': { name: '办公生活用房(3分)', keys: ['B2.1-①校园办公用房面积得分率', 'B2.1-②校园生活服务用房得分率', 'B2.1-③住宿生床位配备得分率'] },
  'B3.图书': { name: '图书配置(2分)', keys: ['B3.1-①生均图书册数得分率', 'B3.2-①图书资源配备得分率'] },
  'B4.教学仪器': { name: '教学仪器(2分)', keys: ['B4.1-①教学仪器设备配备得分率', 'B4.2-①音体美器材配备情况得分率'] },
  'B5.信息化': { name: '校园信息化(3分)', keys: ['B5.1-①无线网覆盖得分率', 'B5.1-②师机比得分率', 'B5.1-③生机比得分率'] },
  'B6.体育': { name: '体育用地(3分)', keys: ['B6.1-①体育运动场(馆)得分率', 'B6.1-②篮、排球场地得分率', 'B6.1-③跑道长度得分率'] },
  'B7.绿地': { name: '校园绿地(1分)', keys: ['B7.1-①生均绿地面积得分率'] },
};
const shortB: Record<string, string> = {
  'B1.1-①得分率': '通风采光', 'B1.1-②普通教室数得分率': '普通教室', 'B1.1-③专用教室面积得分率': '专用教室', 'B1.1-④公共教学用房得分率': '公共教学用房',
  'B1.2-①生均校舍建筑面积得分率': '校舍面积', 'B1.2-②生均用地面积得分率': '生均用地',
  'B2.1-①校园办公用房面积得分率': '办公用房', 'B2.1-②校园生活服务用房得分率': '生活用房', 'B2.1-③住宿生床位配备得分率': '住宿床位',
  'B3.1-①生均图书册数得分率': '图书册数', 'B3.2-①图书资源配备得分率': '图书馆阅览室',
  'B4.1-①教学仪器设备配备得分率': '教学仪器', 'B4.2-①音体美器材配备情况得分率': '音体美器材',
  'B5.1-①无线网覆盖得分率': '无线网', 'B5.1-②师机比得分率': '师机比', 'B5.1-③生机比得分率': '生机比',
  'B6.1-①体育运动场(馆)得分率': '运动场', 'B6.1-②篮、排球场地得分率': '篮排球', 'B6.1-③跑道长度得分率': '跑道',
  'B7.1-①生均绿地面积得分率': '绿地面积',
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
export default function FacilityGrid({ data }: { data: DashboardData }) {
  const r1 = useRef<HTMLDivElement>(null), r2 = useRef<HTMLDivElement>(null), r3 = useRef<HTMLDivElement>(null), r4 = useRef<HTMLDivElement>(null);
  const ct = useRef<HTMLDivElement>(null);
  useEffect(() => { gsap.fromTo(ct.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }); }, []);

  const stypes = ['小学', '初中', '九年制'];
  const scolors = ['#4da8ff', '#00d4ff', '#a855f7'];
  const barColors = ['#f97316', '#06b6d4', '#10b981'];
  const barColorsLight = ['#fb923c', '#22d3ee', '#34d399'];

  // C1: 矩形树图 — 仅显示有不达标学校的指标，过滤空组
  const treeData = Object.entries(catBGroups).map(([, group]) => ({
    name: group.name,
    children: group.keys.map(k => { const ind = data.indicators.find(i => i.key === k); return { name: shortB[k] || k, value: ind?.fail_count ?? 0, rate: ind ? +(ind.avg_rate * 100).toFixed(1) : 0 }; }).filter((c: { value: number }) => c.value > 0),
  })).filter(g => g.children.length > 0);
  useEcharts(r1, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1200, animationEasing: 'cubicOut',
    tooltip: { backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { name: string; value: number }; return `<b>${pa.name}</b><br/>不达标: <b>${pa.value}</b> 所`; } },
    series: [{ type: 'treemap', width: '100%', height: '100%', roam: false, nodeClick: false, breadcrumb: { show: false }, label: { show: true, color: '#e8eaed', fontSize: 10, fontWeight: 'bold' }, upperLabel: { show: true, height: 22, color: '#e8eaed', fontSize: 11, fontWeight: 'bold' }, itemStyle: { borderColor: '#0a0e1a', borderWidth: 2 }, levels: [{ itemStyle: { borderWidth: 3, gapWidth: 3 }, upperLabel: { show: true } }, { colorMappingBy: 'value', color: ['#4ade80', '#facc15', '#ff9f43', '#ff5c5c'] }], data: treeData }],
  });

  // C2: 七子维度×三类学校热力图
  const subgroups = Object.entries(catBGroups);
  const subNames = subgroups.map(([, g]) => g.name);
  const heatData: [number, number, number][] = [];
  subgroups.forEach(([, g], xi) => {
    stypes.forEach((st, yi) => {
      const vals = g.keys.map(k => data.cross_analysis[st]?.[k] ?? 0).filter(v => v > 0);
      const avg = vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length * 100).toFixed(1) : 0;
      heatData.push([xi, yi, avg]);
    });
  });
  useEcharts(r2, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1000,
    tooltip: { backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { value: [number, number, number] }; return `<b>${subNames[pa.value[0]]} · ${stypes[pa.value[1]]}</b><br/>得分率: <b>${pa.value[2]}%</b>`; } },
    grid: { left: '14%', right: '8%', top: '16%', bottom: '5%' },
    xAxis: { type: 'category', data: subNames, axisLabel: { color: '#9aa0b0', fontSize: 9, interval: 0 }, axisTick: { show: false }, position: 'top' },
    yAxis: { type: 'category', data: stypes, axisLabel: { color: '#e8eaed', fontSize: 11 }, axisTick: { show: false } },
    visualMap: buildHeatmapVisualMap(heatData, { orient: 'vertical', right: 0, top: 'center' }),
    series: [{ type: 'heatmap', data: heatData, label: buildHeatmapLabelStyle(10), emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,212,255,0.5)' } }, itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: 'rgba(10,14,26,0.8)' } }],
  });

  // C3: 3D散点图 — 硬件指标三维分析（x=得分率, y=不达标数, z=不达标比例, 自动旋转）
  const bAllInds = data.indicators.filter(i => i.category?.includes('B类') && i.key !== '得分率' && i.fail_count > 0);
  const bMaxFail = Math.max(...bAllInds.map(i => i.fail_count), 1);
  const b3DData = bAllInds.map(ind => ({ name: shortB[ind.key] || ind.name, value: [+(ind.avg_rate).toFixed(3), ind.fail_count, +(ind.fail_pct).toFixed(1), ind.fail_count], rate: ind.avg_rate, fail: ind.fail_count }));
  useEcharts(r3, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1500, animationEasing: 'cubicOut',
    tooltip: { backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { name: string; data: { rate: number; fail: number } }; if (!pa?.data) return ''; return `<b>${pa.name}</b><br/>得分率: ${(pa.data.rate * 100).toFixed(1)}%<br/>不达标: <b>${pa.data.fail}</b> 所`; } },
    visualMap: [{
      top: 6, calculable: true, dimension: 3, min: 1, max: bMaxFail,
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
    xAxis3D: { name: '得分率', nameTextStyle: { color: '#4ade80', fontSize: 10 }, type: 'value', min: 0.3, max: 1.05, axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: (v: number) => (v * 100).toFixed(0) + '%' } },
    yAxis3D: { name: '不达标\n学校数', nameTextStyle: { color: '#ff5c5c', fontSize: 10 }, type: 'value', axisLabel: { color: '#9aa0b0', fontSize: 9 } },
    zAxis3D: { name: '不达标\n比例(%)', nameTextStyle: { color: '#ff9f43', fontSize: 10 }, type: 'value', axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: '{value}%' } },
    series: [{
      type: 'scatter3D',
      dimensions: ['得分率', '不达标学校数', '不达标比例', '不达标学校数'],
      data: b3DData.map(d => ({ name: d.name, value: d.value, rate: d.rate, fail: d.fail })),
      symbolSize: 8,
      itemStyle: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
      label: { show: true, position: 'top', color: '#e8eaed', fontSize: 9, distance: 4, formatter: (p: unknown) => { const d = p as { name: string }; return d.name; } },
      emphasis: { itemStyle: { color: '#fff' }, label: { fontSize: 12, fontWeight: 'bold' } },
    }],
  });

  // C4: 七子维度得分率分布箱线图
  const boxData: number[][] = [];
  const boxNames = subgroups.map(([, g]) => {
    const vals: number[] = [];
    stypes.forEach(st => g.keys.forEach(k => { const v = data.cross_analysis[st]?.[k]; if (v != null && v > 0) vals.push(v); }));
    vals.sort((a, b) => a - b);
    if (vals.length < 2) { boxData.push([0, 0, 0, 0, 0]); return g.name; }
    const q1 = vals[Math.floor(vals.length * 0.25)];
    const q3 = vals[Math.floor(vals.length * 0.75)];
    const med = vals[Math.floor(vals.length * 0.5)];
    boxData.push([vals[0], q1, med, q3, vals[vals.length - 1]]);
    return g.name;
  });
  useEcharts(r4, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1200, animationEasing: 'cubicOut',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eaed', fontSize: 11 } },
    grid: buildSideLegendGrid({ left: "8%", top: "4%" }),
    xAxis: { type: 'category', data: boxNames, axisLabel: { color: '#9aa0b0', fontSize: 8, interval: 0 }, axisTick: { show: false } },
    yAxis: { type: 'value', name: '得分率', nameTextStyle: { color: '#9aa0b0', fontSize: 9 }, axisLabel: { color: '#9aa0b0', fontSize: 9, formatter: (v: number) => (v * 100).toFixed(0) + '%' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: [{ type: 'boxplot', data: boxData, itemStyle: { color: 'rgba(0,212,255,0.15)', borderColor: '#00d4ff', borderWidth: 2 }, boxWidth: [10, 25] }],
  });

  const cells = [
    { r: r3, t: '硬件指标三维分析', i: '🫧', c: '#ff9f43', delay: 'chart-appear-delay-1' },
    { r: r2, t: '七维度×三类学校', i: '🔥', c: '#00d4ff', delay: 'chart-appear-delay-2' },
    { r: r1, t: '硬件不达标分布', i: '🗺️', c: '#ff9f43', delay: 'chart-appear-delay-3' },
    { r: r4, t: '七维度指标分布', i: '📦', c: '#a855f7', delay: 'chart-appear-delay-4' },
  ];

  return (
    <div ref={ct} className="h-full min-h-0">
      <div className="grid grid-cols-2 h-full grid-chart-grid grid-chart-grid--fit">
        {cells.map((item, i) => {
          const cellInsight = getFacilityGridInsight(data, i);
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
