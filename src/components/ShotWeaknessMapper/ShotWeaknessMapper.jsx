import React, { useState, useEffect, useMemo } from 'react';
import { Crosshair, AlertTriangle } from 'lucide-react';
import { storageService } from '../../services/storageService';

const badgeColorMap = {
  aggressor: 'bg-aggressor-bg text-aggressor-text border-aggressor-border',
  anchor: 'bg-anchor-bg text-anchor-text border-anchor-border',
  improving: 'bg-improving-bg text-improving-text border-improving-border',
  liability: 'bg-liability-bg text-liability-text border-liability-border',
};

const barColorMap = {
  liability: 'bg-liability-text/60',
  improving: 'bg-improving-text/60',
  anchor: 'bg-anchor-text/60',
};

const DISMISSAL_PATTERNS = [
  { pattern: /caught.*(long|boundary|deep|mid.?wicket|cow)/i, label: 'Caught Boundary', icon: '🏏', severity: 'high' },
  { pattern: /caught.*(slip|gully|point|short)/i, label: 'Caught Close', icon: '🧤', severity: 'medium' },
  { pattern: /bowled.*(gate|inside|through)/i, label: 'Bowled Through Gate', icon: '🎳', severity: 'high' },
  { pattern: /bowled|clean bowled/i, label: 'Bowled', icon: '🎳', severity: 'medium' },
  { pattern: /lbw|leg.before/i, label: 'LBW', icon: '🦵', severity: 'medium' },
  { pattern: /run.?out/i, label: 'Run Out', icon: '🏃', severity: 'low' },
  { pattern: /stumped/i, label: 'Stumped', icon: '🧤', severity: 'medium' },
  { pattern: /edge|nick|outside.edge/i, label: 'Edged/Nicked', icon: '✋', severity: 'medium' },
  { pattern: /aerial|lofted|miscue|mis.?hit|top.?edge|skied/i, label: 'Aerial Miscue', icon: '☁️', severity: 'high' },
  { pattern: /yorker|full.?toss|toe/i, label: 'Yorker Vulnerability', icon: '🎯', severity: 'high' },
  { pattern: /spin|spinner|turning|swept/i, label: 'Spin Weakness', icon: '🌀', severity: 'high' },
  { pattern: /short|pull|hook|bouncer/i, label: 'Short Ball Trouble', icon: '⚡', severity: 'high' },
  { pattern: /slower|change.?of.?pace|deceived/i, label: 'Pace Change Victim', icon: '🐢', severity: 'medium' },
  { pattern: /dot|block|defensive|no.*scor/i, label: 'Pressure Build-up', icon: '🔒', severity: 'low' },
  { pattern: /soft|lazy|casual|poor.shot/i, label: 'Soft Dismissal', icon: '😤', severity: 'high' },
];

export default function ShotWeaknessMapper() {
  const [allMatches, setAllMatches] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');

  useEffect(() => {
    const load = async () => {
      const matches = await storageService.getMatches();
      setAllMatches(matches);
      const nameSet = new Set();
      matches.forEach(m => {
        (m.analysis?.players || []).forEach(p => nameSet.add(p.name));
      });
      setAllPlayers([...nameSet].sort());
    };
    load();
  }, []);

  const analysis = useMemo(() => {
    if (!selectedPlayer) return null;

    const appearances = [];
    allMatches.forEach(m => {
      const p = (m.analysis?.players || []).find(pl => pl.name === selectedPlayer);
      if (p) appearances.push({ ...p, result: m.result, opponent: m.opponent, date: m.date });
    });

    if (appearances.length === 0) return null;

    // Analyze what_failed text for dismissal patterns
    const weaknesses = {};
    appearances.forEach(a => {
      const text = `${a.what_failed || ''} ${a.next_match_instruction || ''} ${a.practice_drill || ''}`.toLowerCase();
      DISMISSAL_PATTERNS.forEach(dp => {
        if (dp.pattern.test(text)) {
          if (!weaknesses[dp.label]) {
            weaknesses[dp.label] = { count: 0, icon: dp.icon, severity: dp.severity, matches: [] };
          }
          weaknesses[dp.label].count++;
          weaknesses[dp.label].matches.push(a.opponent || 'Unknown');
        }
      });
    });

    // Sort by frequency
    const sorted = Object.entries(weaknesses)
      .sort((a, b) => b[1].count - a[1].count);

    // Find dominant weakness
    const dominant = sorted.length > 0 ? sorted[0] : null;

    return {
      player: selectedPlayer,
      totalMatches: appearances.length,
      weaknesses: sorted,
      dominant,
      role: appearances[0]?.role || 'Unknown'
    };
  }, [selectedPlayer, allMatches]);

  const getSeverityColor = (sev) => {
    if (sev === 'high') return 'liability';
    if (sev === 'medium') return 'improving';
    return 'anchor';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-liability-bg border border-liability-border flex items-center justify-center text-liability-text">
          <Crosshair size={20} />
        </div>
        <div>
          <h2 className="text-lg font-display text-textPrimary">Shot Weakness Mapper</h2>
          <p className="text-xs text-textTertiary font-mono">DISMISSAL ANALYSIS • OPPONENT BRIEFING</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Select Player</label>
          <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer">
            <option value="">Choose a player...</option>
            {allPlayers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {analysis && (
        <div className="space-y-4 animate-fade-in">
          {/* Player header */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-textPrimary text-xl">{analysis.player}</h3>
              <p className="text-xs font-mono text-textSecondary">{analysis.role} • {analysis.totalMatches} matches analyzed</p>
            </div>
            {analysis.dominant && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider font-mono text-liability-text mb-1">Primary Weakness</div>
                <div className="font-display text-textPrimary">{analysis.dominant[0]}</div>
              </div>
            )}
          </div>

          {/* Weakness table */}
          {analysis.weaknesses.length > 0 ? (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <span className="text-sm font-mono uppercase tracking-wider text-textPrimary font-bold flex items-center gap-2">
                  <AlertTriangle size={14} className="text-liability-text" /> Dismissal Pattern Map
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {analysis.weaknesses.map(([label, data], i) => {
                  const color = getSeverityColor(data.severity);
                  return (
                    <div key={i} className="px-6 py-4 flex items-center gap-4">
                      <span className="text-xl w-8">{data.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-textPrimary">{label}</span>
                          <span className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${badgeColorMap[color] || badgeColorMap.anchor}`}>{data.severity}</span>
                        </div>
                        <p className="text-[11px] font-mono text-textTertiary mt-1">vs {data.matches.slice(0, 3).join(', ')}{data.matches.length > 3 ? ` (and ${data.matches.length - 3} others)` : ''}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-display text-accent">{data.count}×</span>
                      </div>
                      {/* Frequency bar */}
                      <div className="w-24 bg-surface2 rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${barColorMap[color] || 'bg-anchor-text/60'} rounded-full transition-all duration-500`} style={{ width: `${Math.min((data.count / analysis.totalMatches) * 100, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-textSecondary font-mono text-sm">No dismissal patterns detected from available data.</p>
            </div>
          )}

          {/* Coaching note */}
          {analysis.dominant && (
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-liability-text">
              <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-2">Opponent Brief</div>
              <p className="text-sm text-textPrimary leading-relaxed">
                <strong>{analysis.player}</strong> gets out to <strong>{analysis.dominant[0].toLowerCase()}</strong> most frequently ({analysis.dominant[1].count}× in {analysis.totalMatches} matches).
                {analysis.dominant[1].severity === 'high'
                  ? ` This is a critical vulnerability — target this with specific field placement and bowling plans.`
                  : ` Monitor this pattern and consider targeted practice drills.`
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
