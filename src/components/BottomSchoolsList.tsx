import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { DashboardData } from '../types';
import FlipCard from './FlipCard';
import InsightBack from './InsightBack';
import { getBottomSchoolsListInsight } from './ChartInsights';
import { useOverviewInView } from '../hooks/useOverviewInView';
import { mountEcharts } from '../utils/chartResize';

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export default function BottomSchoolsList({ data }: { data: DashboardData }) {
  const { ref: scrollRef, inView } = useOverviewInView();
  const chartRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);
  const insight = getBottomSchoolsListInsight(data);

  useEffect(() => {
    if (!inView || hasRendered.current || !chartRef.current) return;
    hasRendered.current = true;
        const bottom = [...data.bottom_schools].reverse(); // show lowest at bottom
    const names = bottom.map(s => s.name);
    const scores = bottom.map(s => s.score);
    const types = bottom.map(s => s.type);
    const areas = bottom.map(s => s.area);

    const typeColors: Record<string, string> = {
      '小学': '#4da8ff',
      '初中': '#00d4ff',
      '九年制': '#a855f7',
    };

    const option: echarts.EChartsCoreOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(22,27,46,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e8eaed', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number }[];
          if (!p?.length) return '';
          const idx = names.indexOf(p[0].name);
          return `<b>${p[0].name}</b><br/>
            总分: <b>${p[0].value}/44</b><br/>
            类型: ${types[idx]}<br/>
            区域: ${areas[idx]}`;
        },
      },
      grid: {
        left: '14%',
        right: '8%',
        top: '3%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        min: 34,
        max: 44,
        axisLabel: { color: '#9aa0b0', fontSize: 10, formatter: '{value}分' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: { color: '#9aa0b0', fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: scores.map((s, i) => ({
            value: s,
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
              color: s <= 37
                ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#ff5c5c' }, { offset: 1, color: '#ff5c5c88' },
                  ])
                : s <= 40
                ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#ff9f43' }, { offset: 1, color: '#ff9f4388' },
                  ])
                : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#facc15' }, { offset: 1, color: '#facc1588' },
                  ]),
            },
          })),
          barWidth: 14,
          label: {
            show: true,
            position: 'right',
            color: '#e8eaed',
            fontSize: 10,
            formatter: '{c}分',
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#ff5c5c', type: 'dashed', width: 1 },
            label: { color: '#ff5c5c', fontSize: 10, formatter: '警戒线 {c}分' },
            data: [{ xAxis: 38, name: '警戒线' }],
          },
        },
        {
          type: 'bar',
          data: scores.map((s, i) => ({
            value: 44 - s,
            itemStyle: {
              borderRadius: [4, 0, 0, 4],
              color: 'rgba(255,92,92,0.08)',
            },
          })),
          barWidth: 14,
          barGap: '-100%',
          z: 0,
          tooltip: { show: false },
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
            <span className="text-accent-red">📋</span>
            低分学校监测 · 得分最低TOP20
          </h3>
          <div className="overview-chart-body">
            <div ref={chartRef} className="overview-chart-canvas" />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-text-muted justify-center overview-chart-footer">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-accent-red" /> 严重预警 ≤37分
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-accent-orange" /> 需关注 38-40分
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-accent-yellow" /> 待提升 41-43分
            </span>
          </div>
        </div>
      }
      back={<InsightBack insight={insight} />}
    />
  );
}
