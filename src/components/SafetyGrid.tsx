import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, PieChart, GaugeChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import gsap from 'gsap';
import type { DashboardData } from '../types';
import FlipCard from './FlipCard';
import InsightBack from './InsightBack';
import { getSafetyGridInsight } from './ChartInsights';
import { observeChartResize } from '../utils/chartResize';
import { useEcharts } from '../hooks/useEcharts';
import { buildSideLegend, buildSideLegendGrid } from '../utils/chartLegend';

echarts.use([BarChart, PieChart, GaugeChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const catAIndicators = [
  { key: 'A1.1得分率', name: '班级数与班额数', group: 'A1.教学规模' },
  { key: 'A1.2得分率', name: '学生总数', group: 'A1.教学规模' },
  { key: 'A2.1得分率', name: '卫生保健室', group: 'A2.校园卫生' },
  { key: 'A2.2.1得分率', name: '食堂等级达标', group: 'A2.校园卫生' },
  { key: 'A2.2.2得分率', name: '小卖部达标', group: 'A2.校园卫生' },
  { key: 'A2.3.1得分率', name: '饮用水卫生', group: 'A2.校园卫生' },
  { key: 'A2.3.2得分率', name: '厕所卫生', group: 'A2.校园卫生' },
  { key: 'A3.1.2得分率', name: '出入口安全', group: 'A3.校园安全' },
  { key: 'A3.1.1得分率', name: '危房情况', group: 'A3.校园安全' },
  { key: 'A3.2.1得分率', name: '保卫人员', group: 'A3.校园安全' },
  { key: 'A3.2.2得分率', name: '宿舍管理员', group: 'A3.校园安全' },
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

export default function SafetyGrid({ data }: { data: DashboardData }) {
  const r1 = useRef<HTMLDivElement>(null), r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null), r4 = useRef<HTMLDivElement>(null);
  const ct = useRef<HTMLDivElement>(null);
  useEffect(() => { gsap.fromTo(ct.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }); }, []);

  const stypes = ['小学', '初中', '九年制'];
  const scolors = ['#4da8ff', '#00d4ff', '#a855f7'];
  const barColors = ['#f97316', '#06b6d4', '#10b981'];
  const barColorsLight = ['#fb923c', '#22d3ee', '#34d399'];

  // C1: 不达标学校数横向柱状图（仅显示有问题的指标，过滤0所）
  const failBars = catAIndicators
    .map(ind => { const f = data.indicators.find(i => i.key === ind.key); return { name: ind.name, group: ind.group, fail: f?.fail_count ?? 0, rate: f ? +(f.avg_rate * 100).toFixed(1) : 100 }; })
    .filter(d => d.fail > 0)
    .sort((a, b) => b.fail - a.fail);
  const maxFail = Math.max(...failBars.map(d => d.fail), 1);
  useEcharts(r1, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1400, animationEasing: 'cubicOut',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#eef0f4', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { name: string; value: number; data: { rate: number } }[]; if (!pa?.length) return ''; const d = pa[0]; return `<b>${d.name}</b><br/>不达标: <b>${d.value}</b> 所<br/>得分率: <b>${d.data.rate}%</b>`; } },
    grid: { left: '3%', right: '10%', top: '3%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', name: '不达标学校数（所）', nameTextStyle: { color: '#b0b8c8', fontSize: 9 }, axisLabel: { color: '#b0b8c8', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, max: maxFail * 1.3 },
    yAxis: { type: 'category', data: failBars.map(d => d.name), axisLabel: { color: '#b0b8c8', fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false }, inverse: true },
    series: [{
      type: 'bar',
      barWidth: '55%',
      data: failBars.map(d => ({
        value: d.fail,
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: d.fail > 50 ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff5c5c' }, { offset: 1, color: '#ff9f43' }])
            : d.fail > 10 ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff9f43' }, { offset: 1, color: '#facc15' }])
            : new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#facc15' }, { offset: 1, color: '#4ade80' }]),
        },
        rate: d.rate,
      })),
      label: { show: true, position: 'right', color: '#eef0f4', fontSize: 11, fontWeight: 'bold', formatter: (p: { value: number }) => p.value + '所' },
    }],
  });

  // C2: A/B/C 三大类得分率对比 —— 环形进度图 + 细分柱状
  // 不用A类内部数据（太均匀），改用三大类别对比，天然有区分度
  const catSummary = data.category_summary;
  const catNames = ['A类-学校管理与安全', 'B类-办学硬件与环境', 'C类-师资队伍与发展'] as const;
  const catLabels = ['A.学校管理与安全', 'B.办学硬件与环境', 'C.师资队伍与发展'];
  const catColors = ['#4da8ff', '#f97316', '#a855f7'];
  const catIcons = ['🛡️', '🏗️', '👩‍🏫'];

  // 每个大类下各学校类型的得分率
  const catSeriesData = stypes.map((st, si) => ({
    name: st,
    type: 'bar' as const,
    barWidth: '20%',
    barGap: '12%',
    itemStyle: {
      borderRadius: [6, 6, 0, 0],
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: catColors[si] }, { offset: 1, color: catColors[si] + '44' },
      ]),
    },
    label: { show: true, position: 'top', color: '#eef0f4', fontSize: 11, fontWeight: 'bold', formatter: '{c}%' },
    data: catNames.map(cat => {
      const rate = catSummary[cat]?.[st] ?? 0;
      return +(rate * 100).toFixed(1);
    }),
  }));

  useEcharts(r2, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1400, animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#eef0f4', fontSize: 11 },
      formatter: (p: unknown) => {
        const pa = p as { seriesName: string; value: number; axisValue: string }[];
        if (!pa?.length) return '';
        return `<b>${pa[0].axisValue}</b><br/>${pa.map(s => `${s.seriesName}: <b>${s.value}%</b>`).join('<br/>')}`;
      },
    },
    legend: buildSideLegend(stypes),
    grid: buildSideLegendGrid({ top: '5%' }),
    xAxis: { type: 'category', data: catLabels, axisLabel: { color: '#eef0f4', fontSize: 11 }, axisTick: { show: false } },
    yAxis: { type: 'value', name: '得分率 (%)', nameTextStyle: { color: '#b0b8c8', fontSize: 9 }, axisLabel: { color: '#b0b8c8', fontSize: 9, formatter: '{value}%' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, min: 75, max: 105 },
    series: catSeriesData,
  });

  // C3: 核心安全指标不达标率 —— 横向分组柱状图（替代雷达图，放大微小差异）
  const coreKeys = ['A1.1得分率', 'A1.2得分率', 'A2.1得分率', 'A2.2.1得分率', 'A3.1.1得分率', 'A3.2.1得分率'];
  const coreNames = ['班级班额', '学生总数', '卫生保健室', '食堂达标', '危房排查', '保卫人员'];
  const coreData = coreKeys.map((k, idx) => {
    const ind = data.indicators.find(i => i.key === k);
    const vals = stypes.map(st => {
      const cr = data.cross_analysis[st]?.[k];
      return cr != null ? +((1 - cr) * 100).toFixed(2) : 0; // fail_pct = (1 - pass_rate) * 100
    });
    return { name: coreNames[idx], key: k, vals, totalFail: vals.reduce((a, b) => a + b, 0) };
  }).filter(d => d.totalFail > 0.01) // 过滤三者全0的指标
    .sort((a, b) => b.totalFail - a.totalFail);

  const coreMaxPct = Math.max(...coreData.flatMap(d => d.vals), 5); // 至少5%上限
  useEcharts(r3, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1400, animationEasing: 'cubicOut',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(22,27,46,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#eef0f4', fontSize: 11 }, formatter: (p: unknown) => { const pa = p as { seriesName: string; value: number; axisValue: string }[]; if (!pa?.length) return ''; return `<b>${pa[0].axisValue}</b><br/>${pa.map(s => `${s.seriesName}: <b>${s.value.toFixed(1)}%</b>`).join('<br/>')}`; } },
    legend: buildSideLegend(stypes),
    grid: buildSideLegendGrid({ top: '6%' }),
    xAxis: { type: 'value', name: '不达标率 (%)', nameTextStyle: { color: '#b0b8c8', fontSize: 9 }, axisLabel: { color: '#b0b8c8', fontSize: 9, formatter: '{value}%' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, max: coreMaxPct * 1.3 },
    yAxis: { type: 'category', data: coreData.map(d => d.name), axisLabel: { color: '#eef0f4', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
    series: stypes.map((st, i) => ({
      name: st, type: 'bar', barWidth: '22%', barGap: '10%',
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: scolors[i] + 'cc' }, { offset: 1, color: scolors[i] + '44' },
        ]),
      },
      label: { show: true, position: 'right', color: '#eef0f4', fontSize: 9, formatter: (p: { value: number }) => p.value > 0.05 ? p.value.toFixed(1) + '%' : '' },
      data: coreData.map(d => d.vals[i]),
    })),
  });

  // C4: A类安全综合得分率仪表盘
  const aAvg = data.indicators.filter(i => i.category?.includes('A类')).reduce((s, i) => s + i.avg_rate, 0) / (data.indicators.filter(i => i.category?.includes('A类')).length || 1);
  const aScore = +(aAvg * 100).toFixed(1);
  useEcharts(r4, {
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1200, animationEasing: 'cubicOut',
    series: [{
      type: 'gauge', startAngle: 180, endAngle: 0, center: ['50%', '75%'], radius: '95%', min: 0, max: 100,
      axisLine: { lineStyle: { width: 6, color: [[0.25, '#FF6E76'], [0.5, '#FDDD60'], [0.75, '#58D9F9'], [1, '#7CFFB2']] } },
      pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 16, offsetCenter: [0, '-60%'], itemStyle: { color: 'auto' } },
      axisTick: { length: 10, lineStyle: { color: 'auto', width: 2 } },
      splitLine: { length: 18, lineStyle: { color: 'auto', width: 4 } },
      axisLabel: { color: '#9aa0b0', fontSize: 13, distance: -50, rotate: 'tangential', formatter: (v: number) => { if (v === 87.5) return '优秀'; if (v === 62.5) return '良好'; if (v === 37.5) return '一般'; if (v === 12.5) return '较差'; return ''; } },
      title: { offsetCenter: [0, '-10%'], color: '#9aa0b0', fontSize: 14 },
      detail: { fontSize: 26, offsetCenter: [0, '-32%'], valueAnimation: true, formatter: (v: number) => Math.round(v) + '%', color: aScore >= 95 ? '#7CFFB2' : '#FDDD60' },
      data: [{ value: aScore, name: '安全管理得分率' }],
    }],
  });

  const cells = [
    { r: r1, t: '不达标指标排名', i: '🔴', c: '#ff5c5c', delay: 'chart-appear-delay-1' },
    { r: r2, t: 'A/B/C三大类别 · 各类学校得分率对比', i: '📊', c: '#4da8ff', delay: 'chart-appear-delay-2' },
    { r: r3, t: '核心指标不达标率 · 三类学校对比', i: '🔍', c: '#ff9f43', delay: 'chart-appear-delay-3' },
    { r: r4, t: '安全管理综合得分率', i: '⏱️', c: '#a855f7', delay: 'chart-appear-delay-4' },
  ];

  return (
    <div ref={ct} className="h-full min-h-0">
      <div className="grid grid-cols-2 h-full grid-chart-grid grid-chart-grid--fit">
        {cells.map((item, i) => {
          const cellInsight = getSafetyGridInsight(data, i);
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
