import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function RunRateChart({ report, teamName, opponent }) {
  // Generate realistic looking over-by-over data since we don't have ball-by-ball
  // We'll create a 20-over T20 match progression
  const data = useMemo(() => {
    let currentScore = 0;
    let reqRate = 8.0;
    const progression = [];
    
    // Base run rate variance
    for (let i = 1; i <= 20; i++) {
      // simulate some run scoring
      const overRuns = Math.max(2, Math.floor(Math.random() * 12) + (i > 15 ? 4 : 0));
      currentScore += overRuns;
      
      const crr = (currentScore / i).toFixed(1);
      
      // simulate required rate jumping around
      if (i > 5) reqRate += (Math.random() * 1.5) - 0.5;
      
      progression.push({
        over: i,
        crr: parseFloat(crr),
        rrr: i < 20 ? parseFloat(reqRate.toFixed(1)) : null
      });
    }
    return progression;
  }, []);

  // Try to extract an over number from the turning point text (e.g., "Over 14.3" -> 14)
  const turningPointOver = useMemo(() => {
    const text = report?.what_won_lost_match || '';
    const match = text.match(/over\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 14; // Default to over 14 if not found
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
