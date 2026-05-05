import React from 'react';

export default function TeamReport({ report }) {
  if (!report) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="bg-surface1 rounded-lg border border-border overflow-hidden">
        
        <div className="p-6 border-b border-border">
          <h3 className="text-[11px] text-textSecondary uppercase tracking-[0.2em] mb-2">Match Turning Point</h3>
          <p className="text-base text-textPrimary leading-relaxed">
            {report.what_won_lost_match}
          </p>
        </div>

        <div className="p-6 border-b border-border">
          <h3 className="text-[11px] text-textSecondary uppercase tracking-[0.2em] mb-2">Strongest Partnership</h3>
          <p className="text-base text-textPrimary leading-relaxed">
            {report.strongest_partnership}
          </p>
        </div>

        <div className="p-6 border-b border-border">
          <h3 className="text-[11px] text-textSecondary uppercase tracking-[0.2em] mb-2">Bowling Inefficiency</h3>
          <p className="text-base text-textPrimary leading-relaxed">
            {report.bowling_inefficiency}
          </p>
        </div>

        <div className="p-6">
          <h3 className="text-[11px] text-textSecondary uppercase tracking-[0.2em] mb-2">Team Pattern</h3>
          <p className="text-base text-textPrimary leading-relaxed">
            {report.pattern}
          </p>
        </div>

      </div>
    </div>
  );
}
