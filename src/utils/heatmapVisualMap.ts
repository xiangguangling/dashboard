/** 高对比度热力图色带：低分深红 → 高分翠绿 */
export const HEATMAP_COLOR_SCALE = [
  '#7f1d1d',
  '#dc2626',
  '#f97316',
  '#eab308',
  '#4ade80',
  '#059669',
];

type HeatmapPoint = [number, number, number];

type VisualMapLayout = {
  orient?: 'horizontal' | 'vertical';
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  itemWidth?: number;
  itemHeight?: number;
};

function extractValues(data: HeatmapPoint[]): number[] {
  return data.map((d) => d[2]).filter((v) => Number.isFinite(v));
}

/** 根据当前热力图数值自动计算 visualMap 范围，放大组内差异 */
export function getHeatmapValueRange(data: HeatmapPoint[]): { min: number; max: number } {
  const values = extractValues(data);
  if (values.length === 0) return { min: 0, max: 100 };

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const range = dataMax - dataMin;

  if (range <= 0) {
    const center = dataMin;
    return {
      min: Math.max(0, +(center - 5).toFixed(1)),
      max: Math.min(100, +(center + 5).toFixed(1)),
    };
  }

  // 数值集中时收窄色阶，避免全部挤在同一颜色区间
  const pad = range < 12 ? Math.max(1, range * 0.12) : Math.max(0.5, range * 0.06);
  let min = +(dataMin - pad).toFixed(1);
  let max = +(dataMax + pad).toFixed(1);

  if (max - min < 8) {
    const mid = (dataMin + dataMax) / 2;
    min = Math.max(0, +(mid - 4).toFixed(1));
    max = Math.min(100, +(mid + 4).toFixed(1));
  }

  min = Math.max(0, min);
  max = Math.min(100, max);
  if (max <= min) max = Math.min(100, min + 1);

  return { min, max };
}

export function buildHeatmapLabelStyle(fontSize = 10) {
  return {
    show: true,
    fontSize,
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textBorderColor: 'rgba(0, 0, 0, 0.85)',
    textBorderWidth: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowBlur: 4,
  };
}

export function buildHeatmapVisualMap(data: HeatmapPoint[], layout: VisualMapLayout = {}) {
  const { min, max } = getHeatmapValueRange(data);

  return {
    min,
    max,
    calculable: false,
    precision: 1,
    orient: layout.orient ?? 'vertical',
    left: layout.left,
    right: layout.right,
    top: layout.top,
    bottom: layout.bottom,
    itemWidth: layout.itemWidth ?? 14,
    itemHeight: layout.itemHeight,
    inRange: { color: HEATMAP_COLOR_SCALE },
    textStyle: { color: '#9aa0b0', fontSize: 9 },
    formatter: (value: number) => `${value}%`,
  };
}
