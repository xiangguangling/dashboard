import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';

export const chartEntranceAnimation: EChartsCoreOption = {
  animation: true,
  animationDuration: 1200,
  animationEasing: 'cubicOut',
};

export function getChartAnimationMs(option: EChartsCoreOption): number {
  if (option.animation === false) return 0;
  const duration = option.animationDuration;
  if (typeof duration === 'number') return duration;
  return 1000;
}

export function observeChartResize(el: HTMLElement, onResize: () => void) {
  const ro = new ResizeObserver(() => onResize());
  ro.observe(el);
  return () => ro.disconnect();
}

export function mountEcharts(el: HTMLElement, option: EChartsCoreOption) {
  const fullOption = { ...chartEntranceAnimation, ...option };
  const animMs = getChartAnimationMs(fullOption);

  const chart = echarts.init(el, 'dark');
  chart.setOption(fullOption);

  const resize = () => {
    if (el.isConnected) chart.resize();
  };

  let unobserve = () => {};
  const obsTimer = window.setTimeout(() => {
    unobserve = observeChartResize(el, resize);
    resize();
  }, animMs + 80);

  const nativeDispose = chart.dispose.bind(chart);
  chart.dispose = () => {
    clearTimeout(obsTimer);
    unobserve();
    nativeDispose();
  };

  return chart;
}
