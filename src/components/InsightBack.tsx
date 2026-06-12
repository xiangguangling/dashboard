import type { ChartInsight } from './ChartInsights';

interface InsightBackProps {
  insight: ChartInsight;
}

export default function InsightBack({ insight }: InsightBackProps) {
  return (
    <div className="insight-back">
      <div className="insight-icon">{insight.icon}</div>
      <div className="insight-title">{insight.title}</div>
      <div className="insight-metric">
        <span className={`insight-big-number ${insight.bigNumberColor}`}>
          {insight.bigNumber}
        </span>
        <span className="insight-unit">{insight.unit}</span>
      </div>
      <p className="insight-desc">{insight.description}</p>
      <span className={`insight-tag ${insight.tag.type}`}>
        {insight.tag.type === 'warn' ? '⚠️' : insight.tag.type === 'good' ? '✅' : 'ℹ️'}
        {insight.tag.text}
      </span>
    </div>
  );
}
