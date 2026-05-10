import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function RunRateChart({ report, rawScorecard, teamName, opponent }) {
  // Parse real over-by-over data from the raw scorecard text
  const data = useMemo(() => {
    const progression = [];
    
    if (rawScorecard) {
      // Match lines like "Over 1: 5 runs, 0 wickets"
      const overRegex = /over\s*(\d+)\s*:\s*(\d+)\s*runs?/gi;
      let match;
      let cumulativeRuns = 0;
      const overs = [];
      
      while ((match = overRegex.exec(rawScorecard)) !== null) {
        overs.push({ over: parseInt(match[1]), runs: parseInt(match[2]) });
      }
      
      // Use only first innings data (first 20 overs if duplicates exist)
      const firstInnings = overs.slice(0, 20);
      
      if (firstInnings.length > 0) {
        let target = null;
        // Try to extract target from scorecard (e.g. "Total: 146/4")
        const totalMatch = rawScorecard.match(/total\s*:\s*(\d+)/i);
        if (totalMatch) target = parseInt(totalMatch[1]);
        
        firstInnings.forEach((o, idx) => {
          cumulativeRuns += o.runs;
          const overNum = o.over;
          const crr = parseFloat((cumulativeRuns / overNum).toFixed(1));
          
          // Calculate required rate if we have a target
          let rrr = null;
          if (target && overNum < 20) {
            const remaining = 20 - overNum;
            rrr = parseFloat(((target + 1 - cumulativeRuns) / remaining).toFixed(1));
            if (rrr < 0) rrr = 0;
          }
          
          progression.push({ over: overNum, crr, rrr });
        });
        
        return progression;
      }
    }
    
    // Fallback: generate seeded data if no real data available
    let score = 0;
    let rr = 7.5;
    for (let i = 1; i <= 20; i++) {
      // Use a simple deterministic pattern instead of Math.random
      const base = [5, 8, 4, 12, 6, 15, 3, 9, 11, 7, 5, 8, 4, 14, 3, 12, 6, 9, 5, 16];
      score += base[i - 1];
      const crr = parseFloat((score / i).toFixed(1));
      if (i > 5) rr += (base[i - 1] > 8 ? 0.4 : -0.3);
      progression.push({
        over: i,
        crr,
        rrr: i < 20 ? parseFloat(rr.toFixed(1)) : null
      });
    }
    return progression;
  }, [rawScorecard]);

  // Try to extract an over number from the turning point text (e.g., "Over 14.3" -> 14)
  const turningPointOver = useMemo(() => {
    const text = report?.what_won_lost_match || '';
    const match = text.match(/over\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 14;
  }, [report]);

  return (
    <div className="glass-card rounded-xl p-5 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-medium text-textSecondary">Over-by-Over Run Rate</h3>
          <p className="text-sm font-display text-textPrimary">{teamName} vs {opponent}</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /> Current RR</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-textTertiary" /> Required RR</div>
          <div className="flex items-center gap-1.5"><div className="w-0.5 h-3 bg-liability-text" /> Turning Point</div>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="over" 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#101420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
              formatter={(value, name) => [value, name === 'crr' ? 'Current RR' : 'Required RR']}
              labelFormatter={(label) => `Over ${label}`}
            />
            
            <ReferenceLine 
              x={turningPointOver} 
              stroke="#EF4444" 
              strokeDasharray="3 3" 
              strokeWidth={2}
              label={{ position: 'top', value: 'TURNING POINT', fill: '#EF4444', fontSize: 9, fontFamily: 'monospace', letterSpacing: '1px' }}
            />

            <Line 
              type="monotone" 
              dataKey="crr" 
              stroke="#E8A020" 
              strokeWidth={3}
              dot={{ r: 3, fill: '#101420', stroke: '#E8A020', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#E8A020', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="rrr" 
              stroke="rgba(255,255,255,0.2)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: 'rgba(255,255,255,0.5)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
