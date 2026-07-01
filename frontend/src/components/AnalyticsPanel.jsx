import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { ShieldAlert, TrendingUp, TrendingDown, CheckCircle, BrainCircuit, Users } from 'lucide-react';

const COLORS = {
  Low: 'var(--risk-low)',
  Medium: 'var(--risk-medium)',
  High: 'var(--risk-high)'
};

function getRecommendations(risk) {
  if (risk === 'Low') {
    return [
      "✓ Continue positive engagement",
      "✓ Reward consistent performance",
      "✓ Offer new learning opportunities"
    ];
  } else if (risk === 'Medium') {
    return [
      "✓ Schedule a 1-on-1 manager check-in",
      "✓ Review career growth and alignment",
      "✓ Provide anonymous feedback channels"
    ];
  }
  return [
    "✓ Immediate HR intervention required",
    "✓ Conduct comprehensive compensation review",
    "✓ Address pain points in work-life balance",
    "✓ Formulate an active retention strategy"
  ];
}

export default function AnalyticsPanel({ result }) {
  if (!result) return (
    <div className="glass-card result-panel animate-fade-in">
      <div className="loader-container">
        <Users size={64} className="text-muted" />
        <h3>Waiting for Prediction</h3>
        <p className="text-muted">Enter employee details and click generate to view analytics.</p>
      </div>
    </div>
  );

  const { attrition_risk, attrition_probability, confidence_score, detailed_factors } = result;
  
  const probPercent = Math.round(attrition_probability * 100);
  const confPercent = Math.round(confidence_score * 100);
  const retentionScore = 100 - probPercent;

  const color = COLORS[attrition_risk];
  const badgeClass = `badge-${attrition_risk.toLowerCase()}`;

  // AI Explanation Generation
  const negativeFactors = detailed_factors.filter(f => f.impact === 'negative');
  const positiveFactors = detailed_factors.filter(f => f.impact === 'positive');

  return (
    <div className="glass-card result-panel animate-fade-in delay-2">
      <div className="analytics-grid">
        
        {/* Risk Score Card */}
        <div className="glass-card flex-col gap-2">
          <div className="section-title"><ShieldAlert className="section-icon" /> Risk Assessment</div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-muted text-sm uppercase tracking-wider mb-1">Overall Risk Level</div>
              <div className={`risk-badge ${badgeClass}`}>{attrition_risk} RISK</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{color}}>{probPercent}%</div>
              <div className="text-muted text-sm">Attrition Probability</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Confidence Score</span>
              <span className="font-bold">{confPercent}%</span>
            </div>
            <div style={{width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px'}}>
              <div style={{width: `${confPercent}%`, height: '100%', background: 'var(--accent)', borderRadius: '4px', transition: 'width 1s ease-out'}} />
            </div>
          </div>
        </div>

        {/* Retention Score Card */}
        <div className="glass-card flex-col gap-2">
          <div className="section-title"><CheckCircle className="section-icon text-success" /> Health Metrics</div>
          <div className="flex justify-between items-center h-full pb-4">
            <div className="text-center w-full">
              <div className="text-4xl font-bold text-success mb-2">{retentionScore}/100</div>
              <div className="text-muted text-sm uppercase tracking-wider">Retention Score</div>
            </div>
          </div>
        </div>

        {/* Feature Importance Chart */}
        <div className="glass-card full-width">
          <div className="section-title"><TrendingUp className="section-icon" /> Feature Impact Analysis</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={detailed_factors} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} width={120} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px'}} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {detailed_factors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.impact === 'negative' ? 'var(--risk-high)' : 'var(--risk-low)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Driving Factors */}
        <div className="glass-card">
          <div className="section-title"><TrendingDown className="section-icon" /> Key Driving Factors</div>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {detailed_factors.map((factor, idx) => (
              <li key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${factor.impact === 'negative' ? 'var(--risk-high)' : 'var(--risk-low)'}`}}>
                <span>{factor.name}</span>
                <span style={{color: factor.impact === 'negative' ? 'var(--risk-high)' : 'var(--risk-low)', fontWeight: 'bold'}}>
                  {factor.impact === 'negative' ? '↑' : '↓'} {Math.round(factor.importance * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Explanation & Recommendations */}
        <div className="glass-card" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div>
            <div className="section-title"><BrainCircuit className="section-icon" /> AI Explanation</div>
            <p className="text-muted text-sm" style={{lineHeight: 1.6}}>
              The model indicates a <strong>{probPercent}%</strong> probability of attrition. 
              {negativeFactors.length > 0 ? ` This is primarily driven by factors such as ${negativeFactors.map(f=>f.name).join(', ')}, which negatively impact retention.` : ''}
              {positiveFactors.length > 0 ? ` However, aspects like ${positiveFactors.map(f=>f.name).join(', ')} provide a stabilizing positive effect.` : ''}
            </p>
          </div>
          <div>
            <div className="section-title">HR Recommendations</div>
            <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)'}}>
              {getRecommendations(attrition_risk).map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
