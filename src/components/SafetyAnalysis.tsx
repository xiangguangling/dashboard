import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import gsap from 'gsap';
import type { DashboardData } from '../types';
import { buildSideLegend, buildSideLegendGrid } from '../utils/chartLegend';

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const catAIndicators = [
  { key: 'A1.1得分率', name: '班级数与班额数', group: 'A1.教学规模' },
  { key: 'A1.2得分率', name: '单一校区学生总数', group: 'A1.教学规模' },
  { key: 'A2.1得分率', name: '卫生保健室配置', group: 'A2.校园卫生' },
  { key: 'A2.2.1得分率', name: '食堂等级达标', group: 'A2.校园卫生' },
  { key: 'A2.2.2得分率', name: '校内小卖部/超市达标', group: 'A2.校园卫生' },
  { key: 'A2.3.1得分率', name: '饮用水供水与卫生', group: 'A2.校园卫生' },
  { key: 'A2.3.2得分率', name: '学校厕所卫生', group: 'A2.校园卫生' },
  { key: 'A3.1.2得分率', name: '校园出入口安全措施', group: 'A3.校园安全' },
  { key: 'A3.1.1得分率', name: '校园危房情况', group: 'A3.校园安全' },
  { key: 'A3.2.1得分率', name: '安全保卫人员配备', group: 'A3.校园安全' },
  { key: 'A3.2.2得分率', name: '专职宿舍管理员配备', group: 'A3.校园安全' },
];

export default function SafetyAnalysis({ data }: { data: DashboardData }) {
  const barRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  // Detailed bar chart by indicator & school type
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
          const p = params as { seriesName: string; value: number; axisValue?: string }[];
          if (!p?.length) return '';
          return `<b>${p[0].axisValue || ''}</b><br/>` +
            p.map(item => `${item.seriesName}: <b>${(item.value * 100).toFixed(1)}%</b>`).join('<br/>');
        },
      },
      legend: buildSideLegend(schoolTypes, { fontSize: 11 }),
      grid: buildSideLegendGrid(),
      xAxis: {
        type: 'category',
        data: catAIndicators.map(i => i.name),
        axisLabel: { color: '#9aa0b0', fontSize: 9, interval: 0 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 0.7,
        max: 1,
        axisLabel: { color: '#9aa0b0', fontSize: 10, formatter: (v: number) => (v * 100).toFixed(0) + '%' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      series: schoolTypes.map((st, i) => ({
        name: st,
        type: 'bar',
        data: catAIndicators.map(ind => {
          const val = data.cross_analysis[st]?.[ind.key] ?? 0;
          return +val.toFixed(3);
        }),
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: colors[i] }, { offset: 1, color: colorsLight[i] }]),
        },
        barWidth: '28%',
        barGap: '8%',
      })),
    };

    chart.setOption(option);
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [data]);

  // Pie: Pass/fail distribution for problem indicators in Cat A
  useEffect(() => {
    if (!typeRef.current) return;
    const chart = echarts.init(typeRef.current, 'dark');

    // Find Cat A indicators with failures
    const problemInds = catAIndicators
      .map(ind => {
        const found = data.indicators.find(i => i.key === ind.key);
        return found ? { ...ind, ...found } : null;
      })
      .filter(Boolean)
      .filter(ind => ind!.fail_count > 0)
      .sort((a, b) => b!.fail_count - a!.fail_count);

    const option: echarts.EChartsCoreOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(22,27,46,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e8eaed', fontSize: 12 },
        formatter: (p: unknown) => {
          const param = p as { name: string; value: number; percent: number };
          return `${param.name}<br/>数量: <b>${param.value}</b> 所 (${param.percent}%)`;
        },
      },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '52%'],
        itemStyle: { borderRadius: 5, borderColor: '#0a0e1a', borderWidth: 3 },
        label: { color: '#9aa0b0', fontSize: 10 },
        emphasis: {
          label: { fontSize: 14, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(77,168,255,0.3)' },
        },
        data: problemInds.map(ind => ({
          value: ind!.fail_count,
          name: ind!.name,
          itemStyle: { color: ind!.avg_rate < 0.95 ? '#ff9f43' : '#4ade80' },
        })),
      }],
    };

    chart.setOption(option);
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [data]);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'A1.教学规模', icon: '📏', desc: '班级数/班额/学生总数', score: 0.989, color: '#4da8ff', glow: 'glow-blue' },
          { label: 'A2.校园卫生', icon: '🏥', desc: '保健室/食堂/饮用水/厕所', score: 0.995, color: '#00d4ff', glow: 'glow-cyan' },
          { label: 'A3.校园安全', icon: '🔒', desc: '危房/出入口/保卫/宿管', score: 0.996, color: '#4ade80', glow: 'glow-green' },
        ].map((card, i) => (
          <div key={i} className={`card-border ${card.glow} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{card.icon}</span>
              <span className="text-xs text-text-muted">{card.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: card.color }}>
              {(card.score * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-text-secondary mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Key finding */}
      <div className="card-border p-4 border-l-4" style={{ borderLeftColor: '#4ade80' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="text-sm font-bold text-accent-green mb-1">安全管理维度总结</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>A类（学校管理与安全）11项指标整体表现<b>优秀</b>，平均得分率 98.9%+</li>
              <li>主要失分点集中在<b>食堂等级达标</b>（18所未达标）和<b>保卫人员配备</b>（18所未达标）</li>
              <li>小学/初中/九年制三类学校安全管理水平<b>基本一致</b>，差异极小</li>
              <li>安全与卫生是标准化建设中<b>最扎实</b>的基石，可作为其他维度的参照标杆</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card-border glow-blue p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-accent-blue">📊</span>
          安全管理11项指标 · 三类学校得分率对比
        </h3>
        <div ref={barRef} style={{ width: '100%', height: '380px' }} />
      </div>

      {/* Pie chart */}
      <div className="card-border glow-green p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-accent-green">🥧</span>
          安全管理维度 · 不达标指标分布
        </h3>
        <div ref={typeRef} style={{ width: '100%', height: '350px' }} />
      </div>
    </div>
  );
}
