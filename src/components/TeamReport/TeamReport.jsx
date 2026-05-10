import React from 'react';
import MomentumChart from '../MomentumChart/MomentumChart';
import RunRateChart from '../RunRateChart/RunRateChart';

const sectionConfig = [
  { key: 'what_won_lost_match', label: 'Match Turning Point', icon: '⚡', accentColor: 'text-accent' },
  { key: 'strongest_partnership', label: 'Strongest Partnership', icon: '🤝', accentColor: 'text-aggressor-text' },
  { key: 'bowling_inefficiency', label: 'Bowling Inefficiency', icon: '🎳', accentColor: 'text-liability-text' },
  { key: 'pattern', label: 'Team Pattern', icon: '📊', accentColor: 'text-anchor-text' },
];

export default function TeamReport({ report, rawScorecard, teamName, opponent }) {
  if (!report) return null;

  const highlightNumbers = (text) => {
    if (!text) return text;
    return text.split(/(\d+(?:\.\d+)?%?)/g).map((part, i) => {
      if (/\d/.test(part)) {
        return <span key={i} className="text-accent font-semibold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Momentum Visualization */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0ms', opacity: 0 }}>
        <MomentumChart
          rawScorecard={rawScorecard}
          teamName={teamName}
          opponent={opponent}
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
        <RunRateChart 
          report={report} 
          rawScorecard={rawScorecard}
          teamName={teamName} 
          opponent={opponent} 
        />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {sectionConfig.map((section, index) => (
          <div 
            key={section.key} 
            className={`p-6 ${index < sectionConfig.length - 1 ? 'border-b border-border' : ''} animate-fade-in-up`}
            style={{ animationDelay: `${(index + 1) * 100}ms`, opacity: 0 }}
          >
            <div className="flex items-center gap-2.5 mb-3">
               <span className="text-base">{section.icon}</span>
               <h3 className={`text-[11px] uppercase tracking-[0.2em] font-medium ${section.accentColor}`}>
                 {section.label}
               </h3>
             </div>
             <p className="text-base text-textPrimary leading-relaxed pl-7">
               {highlightNumbers(report[section.key])}
             </p>
          </div>
        ))}
      </div>
    </div>
  );
}

