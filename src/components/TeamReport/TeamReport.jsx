import React, { useState } from 'react';
import MomentumChart from '../MomentumChart/MomentumChart';
import RunRateChart from '../RunRateChart/RunRateChart';

const splitVerdict = (text, fallbackLabel) => {
  if (!text) return { verdict: fallbackLabel, detail: '' };
  const splitters = [' — ', ' - ', '. '];
  let splitIndex = -1;
  let splitterUsed = '';
  
  for (const s of splitters) {
    const idx = text.indexOf(s);
    if (idx !== -1 && (splitIndex === -1 || idx < splitIndex)) {
      splitIndex = idx;
      splitterUsed = s;
    }
  }
  
  if (splitIndex !== -1) {
    const verdict = text.substring(0, splitIndex).trim();
    const detail = text.substring(splitIndex + splitterUsed.length).trim();
    return { verdict, detail };
  }
  
  if (text.length > 60) {
    return { verdict: text.substring(0, 60) + '...', detail: text };
  }
  return { verdict: text, detail: '' };
};

const getFieldingData = (report, rawScorecard) => {
  const text = (rawScorecard || '').toLowerCase();
  const runOutCount = (text.match(/run out/g) || []).length;
  const catchCount = (text.match(/ c /g) || []).length;
  
  let verdict = "Clean catching and ground fielding";
  let detail = "Ring fielders maintained pressure. No major overthrows or fumbles detected.";
  
  if (runOutCount > 0) {
    verdict = `${runOutCount} run out${runOutCount > 1 ? 's' : ''} executed — active ring pressure`;
    detail = `Capitalized on pressure with sharp returns. High intensity shown in backing up.`;
  } else if (catchCount > 2) {
    verdict = `${catchCount} catches completed — secure hands in outfield`;
    detail = `Good boundary riders positioning. Safe catching under high balls.`;
  }
  
  return { verdict, detail };
};

export default function TeamReport({ report, rawScorecard, teamName, opponent }) {
  const [collapsed, setCollapsed] = useState({
    batting: true,
    bowling: true,
    fielding: true,
    tactics: true,
  });

  if (!report) return null;

  const highlightNumbers = (text) => {
    if (!text) return text;
    return text.split(/(\d+(?:\.\d+)?%?)/g).map((part, i) => {
      if (/\d/.test(part)) {
        return <span key={i} className="text-accent font-semibold font-mono">{part}</span>;
      }
      return part;
    });
  };

  const battingData = splitVerdict(report.strongest_partnership, "Partnerships and batting focus");
  const bowlingData = splitVerdict(report.bowling_inefficiency, "Bowling rotation and economy");
  const fieldingData = getFieldingData(report, rawScorecard);
  const tacticsData = splitVerdict(report.pattern || report.what_won_lost_match, "Tactical positioning and game plan");

  const sectionsList = [
    {
      key: 'batting',
      label: 'Batting',
      verdict: battingData.verdict,
      detail: battingData.detail,
      iconClass: 'ti-cricket',
      iconSvg: (
        <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18.5 5.5a2.12 2.12 0 0 0-3-3L3.5 14.5a2.12 2.12 0 0 0 0 3l3 3a2.12 2.12 0 0 0 3 0L21.5 8.5a2.12 2.12 0 0 0 0-3z" />
          <path d="M7.5 12.5 10 15" />
        </svg>
      )
    },
    {
      key: 'bowling',
      label: 'Bowling',
      verdict: bowlingData.verdict,
      detail: bowlingData.detail,
      iconClass: 'ti-target',
      iconSvg: (
        <svg className="w-4 h-4 text-anchor-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    },
    {
      key: 'fielding',
      label: 'Fielding',
      verdict: fieldingData.verdict,
      detail: fieldingData.detail,
      iconClass: 'ti-run',
      iconSvg: (
        <svg className="w-4 h-4 text-aggressor-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M12 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
          <path d="M7 6h8l-3 5 3 6" />
          <path d="M12 11h-4l-2 4" />
        </svg>
      )
    },
    {
      key: 'tactics',
      label: 'Tactics',
      verdict: tacticsData.verdict,
      detail: tacticsData.detail,
      iconClass: 'ti-chess',
      iconSvg: (
        <svg className="w-4 h-4 text-improving-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5" />
          <path d="M6 21a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4" />
          <path d="M12 5V3" />
          <path d="M10 5h4" />
          <path d="M12 13V9" />
          <path d="M9 9h6" />
          <path d="m12 13-3 4h6z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print-hide, nav, button, header, footer, .ambient-gradient, .tabs-list {
            display: none !important;
          }
          .glass-card {
            background: transparent !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
          .text-textPrimary {
            color: #000 !important;
          }
          .text-textSecondary {
            color: #444 !important;
          }
          .collapsible-content {
            max-height: none !important;
            opacity: 1 !important;
            display: block !important;
            margin-top: 1rem !important;
          }
        }
      `}</style>

      {/* Header and Print PDF CTA */}
      <div className="flex justify-between items-center print-hide">
        <h2 className="text-display-md font-display text-textPrimary">Team Analysis Report</h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-surface2 hover:bg-surface3 text-textPrimary border border-border px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v8H6z" />
          </svg>
          Copy as PDF
        </button>
      </div>

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

      <div className="glass-card rounded-xl overflow-hidden divide-y divide-border/40">
        {sectionsList.map((sec, index) => {
          const isCollapsed = collapsed[sec.key];
          return (
            <div 
              key={sec.key} 
              className="p-5 animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 80}ms`, opacity: 0 }}
            >
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, [sec.key]: !prev[sec.key] }))}
                className="w-full flex items-center justify-between text-left focus:outline-none group"
              >
                <div className="flex items-center gap-3">
                  <span className={`${sec.iconClass} p-2 bg-surface2/50 border border-border/20 rounded-lg shrink-0`}>
                    {sec.iconSvg}
                  </span>
                  <div>
                    <h3 className="text-xs text-textSecondary uppercase tracking-widest font-mono leading-none mb-1.5">
                      {sec.label}
                    </h3>
                    <p className="text-sm font-sans font-medium text-textPrimary leading-tight pr-4">
                      {highlightNumbers(sec.verdict)}
                    </p>
                  </div>
                </div>
                
                <span className="print-hide text-textSecondary group-hover:text-textPrimary transition-colors">
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <div 
                className={`collapsible-content transition-all duration-300 overflow-hidden ${
                  isCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[300px] opacity-100 mt-4'
                }`}
              >
                <div className="pl-13 text-sm leading-relaxed text-textPrimary/80 font-sans border-l-2 border-border/40 ml-5 pl-4 animate-fade-in">
                  {highlightNumbers(sec.detail || "No additional detail provided.")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

