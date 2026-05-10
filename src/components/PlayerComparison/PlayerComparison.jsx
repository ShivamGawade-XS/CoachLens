import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, GitCompare, ChevronRight, Trophy, Target, Zap, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { calculateIntentScore } from '../../utils/coachingMetrics';

export default function PlayerComparison() {
  const [allMatches, setAllMatches] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const load = async () => {
      const matches = await storageService.getMatches();
      setAllMatches(matches);
      
      // Collect all unique player names
      const nameSet = new Set();
      matches.forEach(m => {
        (m.analysis?.players || []).forEach(p => nameSet.add(p.name));
      });
      setAllPlayers([...nameSet].sort());
    };
    load();
  }, []);

  const getPlayerStats = (name) => {
    const appearances = [];
    allMatches.forEach(m => {
      const p = (m.analysis?.players || []).find(pl => pl.name === name);
      if (p) {
        appearances.push({ ...p, result: m.result, matchId: m.id, opponent: m.opponent, date: m.date });
      }
    });

    if (appearances.length === 0) return null;

    const latest = appearances[0];
    const totalMatches = appearances.length;

    // Parse key_stat like "45 (30)" into runs and balls
    const parseKeyStat = (stat) => {
      if (!stat) return { runs: 0, balls: 0 };
      const match = stat.match(/(\d+)\s*\((\d+)\)/);
      if (match) return { runs: parseInt(match[1]), balls: parseInt(match[2]) };
      // Try bowling stat like "2/28 (4)"
      const bowlMatch = stat.match(/(\d+)\/(\d+)\s*\((\d+)\)/);
      if (bowlMatch) return { wickets: parseInt(bowlMatch[1]), runs: parseInt(bowlMatch[2]), overs: parseInt(bowlMatch[3]) };
      return { runs: 0, balls: 0 };
    };

    let totalRuns = 0, totalBalls = 0, totalWickets = 0, totalBowlRuns = 0, totalBowlOvers = 0;
    let totalImpact = 0;
    const tags = { Aggressor: 0, Anchor: 0, Liability: 0, Improving: 0 };
    let wins = 0;

    appearances.forEach(a => {
      const stat = parseKeyStat(a.key_stat);
      if (stat.balls) {
        totalRuns += stat.runs;
        totalBalls += stat.balls;
      }
      if (stat.wickets !== undefined) {
        totalWickets += stat.wickets;
        totalBowlRuns += stat.runs;
        totalBowlOvers += stat.overs;
      }
      totalImpact += parseFloat(a.match_impact || 0);
      if (a.tag && tags[a.tag] !== undefined) tags[a.tag]++;
      if (a.result === 'Won') wins++;
    });

    const avgImpact = (totalImpact / totalMatches).toFixed(1);
    const avgRuns = totalBalls > 0 ? (totalRuns / totalMatches).toFixed(0) : '--';
    const avgSR = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : '--';
    const winRate = ((wins / totalMatches) * 100).toFixed(0);
    const dominantTag = Object.entries(tags).sort((a, b) => b[1] - a[1])[0];
    const intent = calculateIntentScore(latest);

    return {
      name,
      role: latest.role,
      latestTag: latest.tag,
      dominantTag: dominantTag[0],
      dominantTagCount: dominantTag[1],
      totalMatches,
      avgImpact: parseFloat(avgImpact),
      avgRuns,
      avgSR,
      winRate: parseInt(winRate),
      intentScore: intent?.score || '--',
      totalRuns,
      totalBalls,
      totalWickets,
      totalBowlRuns,
      totalBowlOvers,
      tags
    };
  };

  const comparison = useMemo(() => {
    if (!playerA || !playerB || playerA === playerB) return null;
    const a = getPlayerStats(playerA);
    const b = getPlayerStats(playerB);
    if (!a || !b) return null;
    return { a, b };
  }, [playerA, playerB, allMatches]);

  const handleCompare = () => {
    if (playerA && playerB && playerA !== playerB) {
      setShowResult(true);
    }
  };

  const getWinner = (valA, valB, higherIsBetter = true) => {
    const a = parseFloat(valA);
    const b = parseFloat(valB);
    if (isNaN(a) || isNaN(b) || a === b) return 'draw';
    if (higherIsBetter) return a > b ? 'a' : 'b';
    return a < b ? 'a' : 'b';
  };

  const MetricRow = ({ label, valA, valB, higherIsBetter = true, suffix = '' }) => {
    const winner = getWinner(valA, valB, higherIsBetter);
    return (
      <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
        <div className={`flex-1 text-right font-display text-lg ${winner === 'a' ? 'text-accent' : 'text-textSecondary'}`}>
          {valA}{suffix}
          {winner === 'a' && <TrendingUp size={12} className="inline ml-1.5 text-aggressor-text" />}
        </div>
        <div className="w-32 text-center shrink-0">
          <span className="text-[10px] uppercase tracking-wider font-mono text-textTertiary">{label}</span>
        </div>
        <div className={`flex-1 font-display text-lg ${winner === 'b' ? 'text-accent' : 'text-textSecondary'}`}>
          {valB}{suffix}
          {winner === 'b' && <TrendingUp size={12} className="inline ml-1.5 text-aggressor-text" />}
        </div>
      </div>
    );
  };

  const getTagColor = (tag) => {
    if (tag === 'Aggressor') return 'bg-aggressor-bg text-aggressor-text border-aggressor-border';
    if (tag === 'Anchor') return 'bg-anchor-bg text-anchor-text border-anchor-border';
    if (tag === 'Liability') return 'bg-liability-bg text-liability-text border-liability-border';
    if (tag === 'Improving') return 'bg-improving-bg text-improving-text border-improving-border';
    return 'bg-surface2 text-textSecondary border-border';
  };

  // Count wins across metrics
  const getVerdict = () => {
    if (!comparison) return null;
    const { a, b } = comparison;
    const metrics = [
      { a: a.avgImpact, b: b.avgImpact },
      { a: parseFloat(a.avgSR) || 0, b: parseFloat(b.avgSR) || 0 },
      { a: a.winRate, b: b.winRate },
      { a: parseFloat(a.intentScore) || 0, b: parseFloat(b.intentScore) || 0 },
    ];
    let aWins = 0, bWins = 0;
    metrics.forEach(m => {
      if (m.a > m.b) aWins++;
      else if (m.b > m.a) bWins++;
    });
    if (aWins > bWins) return { winner: a.name, score: `${aWins}–${bWins}` };
    if (bWins > aWins) return { winner: b.name, score: `${bWins}–${aWins}` };
    return { winner: 'Tie', score: `${aWins}–${bWins}` };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <GitCompare size={20} />
        </div>
        <div>
          <h2 className="text-lg font-display text-textPrimary">Player Comparison</h2>
          <p className="text-xs text-textTertiary font-mono">HEAD TO HEAD • NUMBERS ONLY</p>
        </div>
      </div>

      {/* Player Selection */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Player A</label>
            <select
              value={playerA}
              onChange={e => { setPlayerA(e.target.value); setShowResult(false); }}
              className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select player...</option>
              {allPlayers.filter(p => p !== playerB).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 border border-accent/20 text-accent shrink-0 mb-0.5">
            <span className="text-sm font-bold">VS</span>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Player B</label>
            <select
              value={playerB}
              onChange={e => { setPlayerB(e.target.value); setShowResult(false); }}
              className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select player...</option>
              {allPlayers.filter(p => p !== playerA).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={!playerA || !playerB || playerA === playerB}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <GitCompare size={16} /> Compare Players
        </button>
      </div>

      {/* Comparison Results */}
      {showResult && comparison && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0ms', opacity: 0 }}>
          {/* Player Headers */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
            <div className="glass-card rounded-2xl p-5 text-center">
              <h3 className="font-display text-textPrimary text-lg truncate">{comparison.a.name}</h3>
              <p className="text-xs font-mono text-textSecondary mt-1">{comparison.a.role}</p>
              <div className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider border ${getTagColor(comparison.a.latestTag)}`}>
                {comparison.a.latestTag}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-display text-sm font-bold">VS</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <h3 className="font-display text-textPrimary text-lg truncate">{comparison.b.name}</h3>
              <p className="text-xs font-mono text-textSecondary mt-1">{comparison.b.role}</p>
              <div className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider border ${getTagColor(comparison.b.latestTag)}`}>
                {comparison.b.latestTag}
              </div>
            </div>
          </div>

          {/* Metrics Table */}
          <div className="glass-card rounded-2xl p-6">
            <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-4 text-center">Performance Metrics</div>
            <MetricRow label="Matches" valA={comparison.a.totalMatches} valB={comparison.b.totalMatches} />
            <MetricRow label="Avg Impact" valA={comparison.a.avgImpact} valB={comparison.b.avgImpact} suffix="/10" />
            <MetricRow label="Avg Runs" valA={comparison.a.avgRuns} valB={comparison.b.avgRuns} />
            <MetricRow label="Avg SR" valA={comparison.a.avgSR} valB={comparison.b.avgSR} />
            <MetricRow label="Win Rate" valA={comparison.a.winRate} valB={comparison.b.winRate} suffix="%" />
            <MetricRow label="Intent Score" valA={comparison.a.intentScore} valB={comparison.b.intentScore} />
          </div>

          {/* Tag Breakdown */}
          <div className="glass-card rounded-2xl p-6">
            <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-4 text-center">Tag Distribution</div>
            <div className="grid grid-cols-2 gap-6">
              {[comparison.a, comparison.b].map(player => (
                <div key={player.name} className="space-y-2">
                  <div className="text-xs font-mono text-textSecondary text-center mb-3">{player.name}</div>
                  {Object.entries(player.tags).filter(([_, v]) => v > 0).map(([tag, count]) => (
                    <div key={tag} className="flex items-center gap-2">
                      <div className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${getTagColor(tag)}`}>{tag}</div>
                      <div className="flex-1 bg-surface2 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-accent/60 rounded-full transition-all duration-500"
                          style={{ width: `${(count / player.totalMatches) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-textTertiary w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Verdict */}
          {(() => {
            const verdict = getVerdict();
            if (!verdict) return null;
            return (
              <div className="glass-card rounded-2xl p-6 border-l-4 border-l-accent text-center">
                <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-2">Verdict</div>
                <div className="text-2xl font-display text-accent">
                  {verdict.winner === 'Tie' ? 'Too Close to Call' : verdict.winner}
                </div>
                <p className="text-xs font-mono text-textSecondary mt-1">
                  {verdict.winner === 'Tie'
                    ? `Metrics split ${verdict.score}. Both players are equally strong.`
                    : `Wins ${verdict.score} across key metrics. Numbers favour this selection.`
                  }
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
