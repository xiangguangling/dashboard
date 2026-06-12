import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import gsap from 'gsap';
import type { DashboardData } from '../types';
import { buildSideLegend, buildSideLegendGrid, sideLegendRadarCenter, sideLegendRadarRadius } from '../utils/chartLegend';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const shortNames: Record<string, string> = {
  'B1.1-④公共教学用房得分率': '公共教学用房',
  'B5.1-③生机比得分率': '生机比',
  'C2.3-①得分率': '中高级职称',
  'B1.1-③专用教室面积得分率': '专用教室面积',
  'C1.1-①得分率': '教职工数',
  'C1.2-①得分率': '生师比',
  'B2.1-②校园生活服务用房得分率': '生活用房',
  'C4.1-①得分率': '音体美教师',
  'B1.2-②生均用地面积得分率': '用地面积',
  'B2.1-①校园办公用房面积得分率': '办公用房',
  'B5.1-②师机比得分率': '师机比',
  'C2.1-①得分率': '教师资格证',
  'B7.1-①生均绿地面积得分率': '绿地面积',
  'C2.2-①得分率': '教师学历',
  'B1.2-①生均校舍建筑面积得分率': '校舍面积',
  'B3.1-①生均图书册数得分率': '图书册数',
};

export default function RegionalAnalysis({ data }: { data: DashboardData }) {
  const barRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  // Bar chart: Compare 3 areas across key indicators
  useEffect(() => {
    if (!barRef.current) return;
    const chart = echarts.init(barRef.current, 'dark');

    const areas = ['城市', '县镇', '农村'];
    const areaData = data.by_urban_rural;

    // Pick indicators with biggest variance
    const keyIndicators = [
      'B1.1-④公共教学用房得分率', 'B5.1-③生机比得分率', 'C2.3-①得分率',
      'B1.1-③专用教室面积得分率', 'C1.1-①得分率', 'C1.2-①得分率',
      'B2.1-②校园生活服务用房得分率', 'C4.1-①得分率',
    ];

    const option: echarts.EChartsCoreOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22,27,46,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e8eaed', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as { seriesName: string; value: number; axisValue: string }[];
          if (!p?.length) return '';
          return `<b>${p[0].axisValue}</b><br/>` +
            p.map(item => `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${item.seriesName === '城市' ? '#4da8ff' : item.seriesName === '县镇' ? '#00d4ff' : '#a855f7'};margin-right:4px;"></span>${item.seriesName}: <b>${(item.value * 100).toFixed(1)}%</b>`)
              .join('<br/>');
        },
      },
      legend: buildSideLegend(areas, { fontSize: 11 }),
      grid: buildSideLegendGrid(),
      xAxis: {
        type: 'category',
        data: keyIndicators.map(k => shortNames[k] || k),
        axisLabel: { color: '#9aa0b0', fontSize: 9, interval: 0 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        max: 1,
        axisLabel: { color: '#9aa0b0', fontSize: 10, formatter: '{value}' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      series: areas.map((area, i) => {
        const colors = ['#f97316', '#06b6d4', '#10b981'];
        const colorsLight = ['#fb923c', '#22d3ee', '#34d399'];
        return {
          name: area,
          type: 'bar',
          data: keyIndicators.map(k => {
            const val = data.urban_rural_analysis[area]?.[k] ?? 0;
            return Number(val.toFixed(3));
          }),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: colors[i] }, { offset: 1, color: colorsLight[i] }]),
          },
          barWidth: '28%',
          barGap: '10%',
          label: {
            show: true,
            position: 'top',
            color: '#e8eaed',
            fontSize: 9,
            formatter: (p: { value: number }) => (p.value * 100).toFixed(0) + '%',
          },
        };
      }),
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
  }, [data]);

  // Differential chart: Urban minus Rural
  useEffect(() => {
    if (!diffRef.current) return;
    const chart = echarts.init(diffRef.current, 'dark');

    const allKeys = Object.keys(shortNames);
    const diffs = allKeys
      .map(k => {
        const city = data.urban_rural_analysis['城市']?.[k] ?? 0;
        const rural = data.urban_rural_analysis['农村']?.[k] ?? 0;
        return { key: k, name: shortNames[k] || k, diff: city - rural, city, rural };
      })
      .sort((a, b) => a.diff - b.diff);

    const option: echarts.EChartsCoreOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22,27,46,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e8eaed', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number }[];
          if (!p?.length) return '';
          const d = diffs.find(x => x.name === p[0].name);
          if (!d) return '';
          return `<b>${d.name}</b><br/>城市: ${(d.city * 100).toFixed(1)}%<br/>农村: ${(d.rural * 100).toFixed(1)}%<br/>差异: <b>${(d.diff * 100).toFixed(1)}%</b>`;
        },
      },
      grid: { left: '3%', right: '8%', top: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#9aa0b0', fontSize: 10, formatter: (v: number) => (v * 100).toFixed(0) + '%' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      yAxis: {
        type: 'category',
        data: diffs.map(d => d.name),
        axisLabel: { color: '#9aa0b0', fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [{
        type: 'bar',
        data: diffs.map(d => ({
          value: d.diff,
          itemStyle: {
            borderRadius: d.diff > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
            color: d.diff > 0
              ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#4da8ff' }, { offset: 1, color: '#00d4ff' }])
              : new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff9f43' }, { offset: 1, color: '#ff5c5c' }]),
          },
        })),
        barWidth: 14,
        label: {
          show: true,
          position: 'right',
          color: '#e8eaed',
          fontSize: 10,
          formatter: (p: { value: number }) => (p.value * 100).toFixed(1) + '%',
        },
      }],
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
  }, [data]);

  const areas = ['城市', '县镇', '农村'];
  const areaCards = areas.map(area => {
    const stats = data.by_urban_rural[area];
    return { area, ...stats };
  });

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {areaCards.map((card, i) => {
          const colors = ['#f97316', '#06b6d4', '#10b981'];
          const glows = ['glow-blue', 'glow-cyan', 'glow-purple'];
          return (
            <div key={i} className={`card-border ${glows[i]} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted uppercase tracking-wider">{card.area}</span>
                <span className="text-lg">{['🏙️', '🏘️', '🌾'][i]}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors[i] }}>
                {card.count} <span className="text-sm text-text-muted">所</span>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-text-muted">均分</span>
                <span style={{ color: colors[i] }} className="font-bold">{card.avg_score} / 44</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">得分率</span>
                <span style={{ color: colors[i] }} className="font-bold">{(card.avg_rate * 100).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key finding callout */}
      <div className="card-border glow-orange p-4 border-l-4" style={{ borderLeftColor: '#ff9f43' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h3 className="text-sm font-bold text-accent-orange mb-1">区域差异核心发现</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>🏙️ <b>城市学校</b>在专用教室面积上优势明显（+22.5%），但<b>生机比（54.4%）严重落后</b>于县镇和农村</li>
              <li>🏘️ <b>县镇学校</b>整体表现均衡，生活服务用房和办公用房达标率领先</li>
              <li>🌾 <b>农村学校</b>在专用教室面积（55.8%）和公共教学用房（24.5%）上<b>严重落后</b>，为最大短板</li>
              <li>📊 <b>总分差距</b>：城市 41.68 &gt; 县镇 41.44 &gt; 农村 40.70（满分44分）</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison bar chart */}
      <div className="card-border glow-blue p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-accent-blue">📊</span>
          城市 vs 县镇 vs 农村 · 关键指标对比
        </h3>
        <div ref={barRef} style={{ width: '100%', height: '380px' }} />
      </div>

      {/* Differential chart */}
      <div className="card-border glow-cyan p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-accent-cyan">↔️</span>
          城市 - 农村得分率差值
        </h3>
        <div ref={diffRef} style={{ width: '100%', height: '450px' }} />
      </div>
    </div>
  );
}
