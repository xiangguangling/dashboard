import type { DashboardData } from '../types';

// ===== 图表深度结论数据 =====

export interface ChartInsight {
  icon: string;
  title: string;
  bigNumber: string;
  bigNumberColor: 'orange' | 'cyan' | 'emerald' | 'rose';
  unit: string;
  description: string;
  tag: { text: string; type: 'warn' | 'good' | 'info' };
}

// 辅助函数
function fmtPct(v: number): string { return (v * 100).toFixed(1); }
function fmtNum(v: number): string { return v.toFixed(0); }

export function getScoreDistributionInsight(data: DashboardData): ChartInsight {
  const { overall, by_school_type } = data;
  const peakScore = data.score_distribution.reduce((a, b) => a.count > b.count ? a : b);
  const elem = by_school_type['小学'];
  const mid = by_school_type['初中'];
  const nine = by_school_type['九年制'];
  const best = elem.avg_score >= mid.avg_score && elem.avg_score >= nine.avg_score ? '小学' :
    mid.avg_score >= nine.avg_score ? '初中' : '九年制';
  return {
    icon: '📈',
    title: '总分分布深度解读',
    bigNumber: fmtPct(overall.avg_rate),
    bigNumberColor: 'orange',
    unit: '% 综合得分率',
    description: `855所学校总分呈右偏分布，峰值集中在${peakScore.score}分段（${peakScore.count}所）。${best}表现最优（均分${(best === '小学' ? elem : best === '初中' ? mid : nine).avg_score.toFixed(1)}），标准差仅${overall.std_score.toFixed(1)}分，说明整体质量均衡。${overall.schools_full_score}所学校获得满分。`,
    tag: { text: `${overall.schools_above_40}所 ≥ 40分`, type: 'good' },
  };
}

export function getIndicatorRadarInsight(data: DashboardData): ChartInsight {
  const worst = data.indicators
    .filter(i => i.category?.includes('B类'))
    .sort((a, b) => a.avg_rate - b.avg_rate)[0];
  return {
    icon: '🎯',
    title: '雷达图核心发现',
    bigNumber: fmtPct(worst?.avg_rate ?? 0),
    bigNumberColor: 'rose',
    unit: '% 最大短板',
    description: `三类学校在16项核心指标上表现高度分化。小学在多数指标上领先，初中和九年制各有短板。"${worst?.name || '公共教学用房'}"是三类学校共同的最弱项（得分率仅${fmtPct(worst?.avg_rate ?? 0)}%），${worst?.fail_count || 0}所学校未达标，需重点关注。`,
    tag: { text: `${worst?.fail_count || 0}所不达标`, type: 'warn' },
  };
}

export function getWeaknessBarsInsight(data: DashboardData): ChartInsight {
  const worst15 = data.indicators.sort((a, b) => a.avg_rate - b.avg_rate).slice(0, 15);
  const critical = worst15.filter(i => i.avg_rate < 0.5).length;
  const improvement = worst15.filter(i => i.avg_rate >= 0.5 && i.avg_rate < 0.8).length;
  return {
    icon: '🔴',
    title: '短板指标深度剖析',
    bigNumber: String(worst15.length),
    bigNumberColor: 'rose',
    unit: '项关键短板',
    description: `15项最低得分率指标中，${critical}项处于"严重不足"（<50%）、${improvement}项"需改进"（50-80%）。B类硬件设施指标占比最高，C类师资指标次之。平均每项短板影响${Math.round(worst15.reduce((s, i) => s + i.fail_count, 0) / worst15.length)}所学校。`,
    tag: { text: `${critical}项严重不足`, type: 'warn' },
  };
}

export function getSchoolTypeComparisonInsight(data: DashboardData): ChartInsight {
  const { category_summary } = data;
  const bestType = ['小学', '初中', '九年制'].reduce((a, b) => {
    const aAvg = Object.values(category_summary).reduce((s, c) => s + (c[a] || 0), 0) / 3;
    const bAvg = Object.values(category_summary).reduce((s, c) => s + (c[b] || 0), 0) / 3;
    return aAvg >= bAvg ? a : b;
  });
  const dims = Object.entries(category_summary);
  const maxGap = dims.reduce((max, [, vals]) => {
    const gap = Math.max(...Object.values(vals)) - Math.min(...Object.values(vals));
    return Math.max(max, gap);
  }, 0);
  return {
    icon: '🏫',
    title: '校型对比结论',
    bigNumber: fmtPct(maxGap),
    bigNumberColor: 'cyan',
    unit: '% 最大校际差异',
    description: `${bestType}在三大维度综合表现最优。三种学校类型在"学校管理与安全"维度差异最小（得分率均超98%），在"办学硬件与环境"维度差异最大（最大差距${fmtPct(maxGap)}%）。九年制学校因学段跨度大，资源配置面临更大挑战。`,
    tag: { text: `${bestType}综合最优`, type: 'good' },
  };
}

export function getUrbanRuralHeatmapInsight(data: DashboardData): ChartInsight {
  const { by_urban_rural } = data;
  const city = by_urban_rural['城市'];
  const rural = by_urban_rural['农村'];
  const gap = city.avg_rate - rural.avg_rate;
  return {
    icon: '🌐',
    title: '城乡差异热力分析',
    bigNumber: fmtPct(Math.abs(gap)),
    bigNumberColor: 'rose',
    unit: '% 城乡得分率差',
    description: `城市学校均分${city.avg_score}，农村学校均分${rural.avg_score}，城乡差距${(gap * 100).toFixed(1)}个百分点。专用教室面积、公共教学用房和生机比是城乡差异最大的三项指标。农村学校数量占${rural.count}所，提升农村办学条件是缩小差距的关键。`,
    tag: { text: `城市领先${fmtPct(gap)}%`, type: 'warn' },
  };
}

export function getSankeyPassFlowInsight(data: DashboardData): ChartInsight {
  const totalFail = data.indicators.reduce((s, i) => s + i.fail_count, 0);
  const bFails = data.indicators.filter(i => i.category?.includes('B类')).reduce((s, i) => s + i.fail_count, 0);
  return {
    icon: '🔀',
    title: '流向图深度分析',
    bigNumber: String(totalFail),
    bigNumberColor: 'rose',
    unit: '项次不达标',
    description: `三大维度共计${totalFail}项次不达标，其中B类（硬件设施）占比最高（${((bFails / totalFail) * 100).toFixed(0)}%），是问题最集中的维度。不达标指标主要流向农村学校和初中学校，呈现明显的"类型×区域"交叉特征。`,
    tag: { text: `B类占${((bFails / totalFail) * 100).toFixed(0)}%`, type: 'warn' },
  };
}

export function getCrisisAlertInsight(data: DashboardData): ChartInsight {
  const worst = data.indicators.sort((a, b) => a.avg_rate - b.avg_rate)[0];
  return {
    icon: '🚨',
    title: '关键预警深度解读',
    bigNumber: fmtPct(worst.avg_rate),
    bigNumberColor: 'rose',
    unit: '% 最低指标得分率',
    description: `"${worst.name}"是全部44项指标中的最大短板，得分率仅${fmtPct(worst.avg_rate)}%，${worst.fail_count}所学校未达标（占比${worst.fail_pct}%）。该指标直接影响学校的综合评分，建议列为下一阶段重点整改项目。${data.overall.schools_full_score}所满分学校可作为标杆参考。`,
    tag: { text: `${worst.fail_count}所不达标`, type: 'warn' },
  };
}

export function getBottomSchoolsListInsight(data: DashboardData): ChartInsight {
  const bottoms = data.bottom_schools || [];
  const minScore = bottoms.length > 0 ? bottoms[0].score : data.overall.min_score;
  const below40 = bottoms.filter((s: { score: number }) => s.score < 40).length;
  return {
    icon: '📋',
    title: '低分学校深度分析',
    bigNumber: String(bottoms.length),
    bigNumberColor: 'rose',
    unit: '所重点监测学校',
    description: `得分最低的${bottoms.length}所学校中，${below40}所低于40分。最低分仅${minScore}分，与平均分差距达${(data.overall.avg_score - minScore).toFixed(1)}分。这些学校集中在农村地区和部分县镇，硬件设施和师资配置是主要制约因素。建议"一校一策"精准帮扶。`,
    tag: { text: `${below40}所低于40分`, type: 'warn' },
  };
}

export function getIndicatorSunburstInsight(data: DashboardData): ChartInsight {
  const aFails = data.indicators.filter(i => i.category?.includes('A类')).reduce((s, i) => s + i.fail_count, 0);
  const bFails = data.indicators.filter(i => i.category?.includes('B类')).reduce((s, i) => s + i.fail_count, 0);
  const cFails = data.indicators.filter(i => i.category?.includes('C类')).reduce((s, i) => s + i.fail_count, 0);
  const maxCat = aFails >= bFails && aFails >= cFails ? 'A类·管理安全' : bFails >= cFails ? 'B类·硬件设施' : 'C类·师资队伍';
  return {
    icon: '🌳',
    title: '环形树图核心结论',
    bigNumber: String(aFails + bFails + cFails),
    bigNumberColor: 'orange',
    unit: '项次总不达标',
    description: `44项指标按四层环形树展开：中心=监测体系，第一环=A/B/C三大维度，第二环=16个子类，外环=具体指标。节点颜色=得分率等级（红<50% 橙50-70% 黄70-85% 绿≥85% 蓝≥95%）。${maxCat}不达标最集中。`,
    tag: { text: `${maxCat}最集中`, type: 'info' },
  };
}

export function getRegionalGridInsight(data: DashboardData, cellIndex: number): ChartInsight {
  const { by_urban_rural } = data;
  const city = by_urban_rural['城市'];
  const town = by_urban_rural['县镇'];
  const rural = by_urban_rural['农村'];

  const insights: ChartInsight[] = [
    {
      icon: '🫧',
      title: '城乡3D散点图解读',
      bigNumber: fmtPct(Math.abs(city.avg_rate - rural.avg_rate)),
      bigNumberColor: 'rose',
      unit: '% 城乡得分率差',
      description: `3D散点图中每个点代表一个指标：x轴=城市得分率，y轴=农村得分率，z轴=不达标学校数，颜色=严重程度。${city.avg_score > rural.avg_score ? '城市' : '农村'}综合占优。图表默认自动旋转，可拖拽交互。`,
      tag: { text: `${city.avg_score > rural.avg_score ? '城市' : '农村'}综合占优`, type: 'warn' },
    },
    {
      icon: '📊',
      title: '区域双轴对比结论',
      bigNumber: fmtPct(Math.max(city.avg_rate, town.avg_rate, rural.avg_rate) - Math.min(city.avg_rate, town.avg_rate, rural.avg_rate)),
      bigNumberColor: 'cyan',
      unit: '% 最大区域差异',
      description: `城市（${fmtPct(city.avg_rate)}%）、县镇（${fmtPct(town.avg_rate)}%）、农村（${rural.avg_rate != null ? fmtPct(rural.avg_rate) : '--'}%）在8项关键指标上表现各异。双轴柱线图：柱=得分率，红线=不达标学校数，综合呈现指标表现全貌。`,
      tag: { text: `${city.avg_score > rural.avg_score ? '城市' : '农村'}均分领先`, type: 'info' },
    },
    {
      icon: '🎯',
      title: '区域六维雷达解读',
      bigNumber: fmtPct(rural.avg_rate),
      bigNumberColor: 'rose',
      unit: '% 农村综合得分率',
      description: `三大区域在师资配置、硬件设施、信息化、校舍条件、图书绿地、职称达标六个维度上的雷达对比。城市在各维度领先，农村在信息化和师资配置上差距最明显。`,
      tag: { text: `${rural.count}所农村学校`, type: 'warn' },
    },
    {
      icon: '⏱️',
      title: '城乡均衡指数解读',
      bigNumber: city.avg_score.toFixed(1),
      bigNumberColor: 'emerald',
      unit: '分 城市均分',
      description: `三大区域总分对比：城市${city.avg_score.toFixed(1)}分 > 县镇${town.avg_score.toFixed(1)}分 > 农村${rural.avg_score.toFixed(1)}分。黄色虚线标注全市均分${data.overall.avg_score.toFixed(1)}分。县镇学校表现接近全市平均水平。`,
      tag: { text: `全市均分${data.overall.avg_score.toFixed(1)}`, type: 'good' },
    },
  ];

  return insights[cellIndex] || insights[0];
}

export function getSafetyGridInsight(data: DashboardData, cellIndex: number): ChartInsight {
  const aIndicators = data.indicators.filter(i => i.category?.includes('A类'));
  const failTotal = aIndicators.reduce((s, i) => s + i.fail_count, 0);
  const bestInd = aIndicators.sort((a, b) => b.avg_rate - a.avg_rate)[0];
  const worstInd = aIndicators.sort((a, b) => a.avg_rate - b.avg_rate)[0];

  const insights: ChartInsight[] = [
    {
      icon: '🔴',
      title: '不达标指标排名解读',
      bigNumber: String(failTotal),
      bigNumberColor: failTotal > 50 ? 'rose' : 'orange',
      unit: '项次不达标',
      description: `横向柱状图仅显示存在不达标学校的指标（已隐藏0所指标）。${worstInd?.name || ''}不达标${worstInd?.fail_count || 0}所，是安全类最突出的短板。整体安全管理水平优秀，仅少数边缘指标需关注。`,
      tag: { text: failTotal > 50 ? '需关注' : '风险可控', type: failTotal > 50 ? 'warn' : 'good' },
    },
    {
      icon: '📊',
      title: '三大类别对比解读',
      bigNumber: fmtPct(aIndicators.reduce((s, i) => s + i.avg_rate, 0) / aIndicators.length),
      bigNumberColor: 'emerald',
      unit: '% A类得分率',
      description: `A/B/C三大类别横向对比——A类（管理与安全）得分率最高（${fmtPct(aIndicators.reduce((s, i) => s + i.avg_rate, 0) / aIndicators.length)}%），B类（硬件设施）相对薄弱。${bestInd?.name || '危房排查'}已全面达标，安全管理整体为三大类别中最优。`,
      tag: { text: 'A类三大类别最优', type: 'good' },
    },
    {
      icon: '🔍',
      title: '核心指标不达标率解读',
      bigNumber: fmtPct(aIndicators.reduce((s, i) => s + i.avg_rate, 0) / aIndicators.length),
      bigNumberColor: 'emerald',
      unit: '% 平均得分率',
      description: `改用不达标率（替代得分率）放大微小差异。六项核心安全指标中，${aIndicators.filter(i => i.fail_count > 0).length}项仍存在少量不达标学校。三类学校差异极小，安全管理标准化程度高。`,
      tag: { text: '高度标准化', type: 'good' },
    },
    {
      icon: '⏱️',
      title: '安全管理仪表盘解读',
      bigNumber: '99.0',
      bigNumberColor: 'emerald',
      unit: '% 校园安全得分率',
      description: `仪表盘显示A类11项指标综合得分率${(aIndicators.reduce((s, i) => s + i.avg_rate, 0) / aIndicators.length * 100).toFixed(1)}%，指针指向绿色优秀区间。安全管理是学校标准化建设中最亮眼的维度，危房排查全面清零。`,
      tag: { text: '安全管理优秀', type: 'good' },
    },
  ];

  return insights[cellIndex] || insights[0];
}

export function getFacilityGridInsight(data: DashboardData, cellIndex: number): ChartInsight {
  const bIndicators = data.indicators.filter(i => i.category?.includes('B类'));
  const failTotal = bIndicators.reduce((s, i) => s + i.fail_count, 0);
  const worst = bIndicators.sort((a, b) => a.avg_rate - b.avg_rate)[0];
  const best = bIndicators.sort((a, b) => b.avg_rate - a.avg_rate)[0];

  const insights: ChartInsight[] = [
    {
      icon: '🎯',
      title: '硬件3D散点图解读',
      bigNumber: String(worst?.fail_count || 0),
      bigNumberColor: 'rose',
      unit: `所 "${worst?.name || ''}"不达标`,
      description: `3D散点图中每个点代表一个B类指标：x=得分率，y=不达标学校数，z=不达标比例，颜色=严重程度。"${worst?.name || '专用教室'}"在三维空间中远离集群，是最需优先整改的指标。自动旋转可全面观察。`,
      tag: { text: `${worst?.fail_count || 0}所待整改`, type: 'warn' },
    },
    {
      icon: '�',
      title: '硬件热力图解读',
      bigNumber: fmtPct(bIndicators.reduce((s, i) => s + i.avg_rate, 0) / bIndicators.length),
      bigNumberColor: 'orange',
      unit: '% B类平均得分率',
      description: `热力图展示七个子维度×三类学校的得分率矩阵。颜色越绿越优，越红越弱。信息化和教学用房维度红色区域最多，是硬件建设的核心瓶颈。`,
      tag: { text: '硬件短板突出', type: 'warn' },
    },
    {
      icon: '🗺️',
      title: '硬件设施树图解读',
      bigNumber: String(failTotal),
      bigNumberColor: 'rose',
      unit: '项次不达标',
      description: `B类20项硬件指标中，矩形面积越大表示不达标学校越多。体育用地和教学仪器不达标相对集中（绿色），专用教室和信息化设备问题最突出（红色）。${worst?.name || ''}是最大短板。`,
      tag: { text: `${failTotal}项次待整改`, type: 'warn' },
    },
    {
      icon: '�',
      title: '硬件箱线图解读',
      bigNumber: fmtPct(bIndicators.filter(i => i.avg_rate >= 0.9).length / bIndicators.length),
      bigNumberColor: 'cyan',
      unit: '% 指标达标率≥90%',
      description: `箱线图展示七个子维度内各指标的得分率分布（最小值/Q1/中位数/Q3/最大值）。教学用房维度离散度最大，说明该维度内指标表现极不均衡，需重点关注。`,
      tag: { text: '校际差异显著', type: 'info' },
    },
  ];

  return insights[cellIndex] || insights[0];
}

export function getFacultyGridInsight(data: DashboardData, cellIndex: number): ChartInsight {
  const cIndicators = data.indicators.filter(i => i.category?.includes('C类'));
  const failTotal = cIndicators.reduce((s, i) => s + i.fail_count, 0);
  const worst = cIndicators.sort((a, b) => a.avg_rate - b.avg_rate)[0];
  const best = cIndicators.sort((a, b) => b.avg_rate - a.avg_rate)[0];

  const insights: ChartInsight[] = [
    {
      icon: '🎯',
      title: '师资3D散点图解读',
      bigNumber: '92.0',
      bigNumberColor: 'rose',
      unit: '% 初中师资最低',
      description: `3D散点图中每个点代表一个C类指标：x=得分率，y=不达标学校数，z=不达标比例，颜色=严重程度。中高级职称和教职工数是两个最突出问题。图表自动旋转展示三维数据关系。`,
      tag: { text: '初中师资待加强', type: 'warn' },
    },
    {
      icon: '�',
      title: '师资热力图解读',
      bigNumber: String(worst?.fail_count || 0),
      bigNumberColor: 'rose',
      unit: `所 "${worst?.name || ''}"不达标`,
      description: `热力图展示六维度×三类学校的得分率矩阵。编制设置和学历职称维度红色区域最多，教师培训维度最绿。初中在多个维度落后于小学和九年制。`,
      tag: { text: `${failTotal}项次不达标`, type: 'warn' },
    },
    {
      icon: '🎯',
      title: '师资六维度雷达解读',
      bigNumber: '76.8',
      bigNumberColor: 'rose',
      unit: '% 中高级职称最低',
      description: `六大子维度中，教师培训得分率最高，中高级职称比例最低（76.8%）。初中在学历职称和编制设置上短板明显。编制设置和学历职称是师资建设的两个主要瓶颈。数据保留一位小数。`,
      tag: { text: '培训达标率领先', type: 'good' },
    },
    {
      icon: '🍭',
      title: '师资棒棒糖图解读',
      bigNumber: String(failTotal),
      bigNumberColor: 'rose',
      unit: '项次 C类不达标',
      description: `棒棒糖图用横线+圆点从大到小排列13项师资指标得分率。绿色=优秀(≥95%)，黄色=良好(85-95%)，红色=需改进(<85%)。"${worst?.name || '中高级职称'}"得分率最低（${fmtPct(worst?.avg_rate || 0)}%），是师资建设最大瓶颈。`,
      tag: { text: '结构性矛盾突出', type: 'warn' },
    },
  ];

  return insights[cellIndex] || insights[0];
}
