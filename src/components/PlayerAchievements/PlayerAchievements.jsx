import React, { useMemo } from 'react';
import { Trophy, Star, Target, Crosshair, Zap, Crown, Flame, TrendingUp } from 'lucide-react';

/**
 * Computes player achievements from all match data.
 * Awards are derived entirely from performance data — no manual input.
 */
function computeAchievements(playerName, allMatches) {
  const achievements = [];

  if (!allMatches || allMatches.length === 0) return achievements;

  // ── Man of the Match (highest match_impact in a single match) ──
  allMatches.forEach(match => {
    if (!match.analysis?.players || match.analysis.players.length === 0) return;
    const players = match.analysis.players;
    const sorted = [...players].sort((a, b) => 
      (parseFloat(b.match_impact) || 0) - (parseFloat(a.match_impact) || 0)
    );
    if (sorted[0] && sorted[0].name === playerName) {
      achievements.push({
        type: 'motm',
        label: 'Player of the Match',
        icon: Trophy,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/25',
        glow: 'shadow-[0_0_16px_rgba(250,204,21,0.12)]',
        detail: `vs ${match.opponent}`,
        subDetail: new Date(match.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        impact: parseFloat(sorted[0].match_impact) || 0,
        matchId: match.id,
      });
    }
  });

  // ── Best Batsman (highest impact among Batsmen across all matches) ──
  const roleAwards = [
    { role: 'Batsman', type: 'best_batsman', label: 'Best Batsman', icon: Target, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/25' },
    { role: 'Bowler', type: 'best_bowler', label: 'Best Bowler', icon: Crosshair, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/25' },
    { role: 'Allrounder', type: 'best_allrounder', label: 'Best All-rounder', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/25' },
  ];

  roleAwards.forEach(({ role, type, label, icon, color, bg, border }) => {
    // Accumulate average impact per player for this role
    const roleAccumulator = {};
    allMatches.forEach(match => {
      (match.analysis?.players || []).forEach(p => {
        if (p.role !== role) return;
        if (!roleAccumulator[p.name]) roleAccumulator[p.name] = { total: 0, count: 0 };
        roleAccumulator[p.name].total += parseFloat(p.match_impact) || 0;
        roleAccumulator[p.name].count += 1;
      });
    });

    const entries = Object.entries(roleAccumulator)
      .filter(([, d]) => d.count >= 2) // Need at least 2 appearances
      .map(([name, d]) => ({ name, avg: d.total / d.count, apps: d.count }))
      .sort((a, b) => b.avg - a.avg);

    if (entries.length > 0 && entries[0].name === playerName) {
      achievements.push({
        type,
        label,
        icon,
        color,
        bg,
        border,
        glow: '',
        detail: `Avg Impact: ${entries[0].avg.toFixed(1)}`,
        subDetail: `${entries[0].apps} matches`,
        impact: entries[0].avg,
      });
    }
  });

  // ── Man of the Series (highest average impact across ALL matches, min 3 apps) ──
  const seriesAccumulator = {};
  allMatches.forEach(match => {
    (match.analysis?.players || []).forEach(p => {
      if (!seriesAccumulator[p.name]) seriesAccumulator[p.name] = { total: 0, count: 0 };
      seriesAccumulator[p.name].total += parseFloat(p.match_impact) || 0;
      seriesAccumulator[p.name].count += 1;
    });
  });
  const seriesEntries = Object.entries(seriesAccumulator)
    .filter(([, d]) => d.count >= 3)
    .map(([name, d]) => ({ name, avg: d.total / d.count, apps: d.count }))
    .sort((a, b) => b.avg - a.avg);

  if (seriesEntries.length > 0 && seriesEntries[0].name === playerName) {
    achievements.push({
      type: 'mots',
      label: 'Player of the Season',
      icon: Crown,
      color: 'text-yellow-300',
      bg: 'bg-gradient-to-br from-yellow-400/15 to-amber-500/10',
      border: 'border-yellow-400/30',
      glow: 'shadow-[0_0_24px_rgba(250,204,21,0.15)]',
      detail: `Avg Impact: ${seriesEntries[0].avg.toFixed(1)}`,
      subDetail: `${seriesEntries[0].apps} matches analyzed`,
      impact: seriesEntries[0].avg,
    });
  }

  // ── Consistency Award (lowest std deviation with 3+ appearances & avg >= 6) ──
  const consistencyData = {};
  allMatches.forEach(match => {
    (match.analysis?.players || []).forEach(p => {
      if (!consistencyData[p.name]) consistencyData[p.name] = [];
      consistencyData[p.name].push(parseFloat(p.match_impact) || 0);
    });
  });
  const consistencyEntries = Object.entries(consistencyData)
    .filter(([, scores]) => scores.length >= 3)
    .map(([name, scores]) => {
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      const variance = scores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / scores.length;
      return { name, stdDev: Math.sqrt(variance), avg, apps: scores.length };
    })
    .filter(e => e.avg >= 6) // Only if they're consistently GOOD
    .sort((a, b) => a.stdDev - b.stdDev);

  if (consistencyEntries.length > 0 && consistencyEntries[0].name === playerName) {
    achievements.push({
      type: 'consistency',
      label: 'Most Consistent',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/25',
      glow: '',
      detail: `σ ${consistencyEntries[0].stdDev.toFixed(2)}`,
      subDetail: `Avg ${consistencyEntries[0].avg.toFixed(1)} across ${consistencyEntries[0].apps} matches`,
      impact: consistencyEntries[0].avg,
    });
  }

  // ── Hot Streak (3+ consecutive matches with impact >= 7) ──
  const playerMatchesSorted = [];
  [...allMatches].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(match => {
    const p = (match.analysis?.players || []).find(pl => pl.name === playerName);
    if (p) playerMatchesSorted.push({ impact: parseFloat(p.match_impact) || 0, date: match.date, opponent: match.opponent });
  });

  let maxStreak = 0, currentStreak = 0;
  playerMatchesSorted.forEach(m => {
    if (m.impact >= 7) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
    else { currentStreak = 0; }
  });

  if (maxStreak >= 3) {
    achievements.push({
      type: 'hot_streak',
      label: 'Hot Streak',
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      border: 'border-orange-400/25',
      glow: '',
      detail: `${maxStreak} consecutive 7+ impact matches`,
      subDetail: 'Elite-level sustained performance',
      impact: maxStreak,
    });
  }

  return achievements;
}

export default function PlayerAchievements({ playerName, allMatches }) {
  const achievements = useMemo(() => computeAchievements(playerName, allMatches), [playerName, allMatches]);

  if (achievements.length === 0) return null;

  // Separate the top-tier awards from match-level awards
  const topAwards = achievements.filter(a => ['mots', 'best_batsman', 'best_bowler', 'best_allrounder', 'consistency', 'hot_streak'].includes(a.type));
  const motmAwards = achievements.filter(a => a.type === 'motm');

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-display text-textPrimary flex items-center gap-2">
        <Trophy size={18} className="text-accent" /> Achievements
        <span className="px-2 py-0.5 rounded-lg bg-accent/10 text-accent text-[10px] font-mono font-bold border border-accent/20">
          {achievements.length}
        </span>
      </h2>

      {/* Top-Tier Awards */}
      {topAwards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topAwards.map((award, idx) => {
            const Icon = award.icon;
            return (
              <div
                key={`${award.type}-${idx}`}
                className={`${award.bg} ${award.border} border rounded-2xl p-5 ${award.glow} transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl bg-white/[0.06] border ${award.border}`}>
                    <Icon size={20} className={award.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${award.color} mb-0.5`}>{award.label}</h3>
                    <p className="text-xs font-mono text-textSecondary">{award.detail}</p>
                    <p className="text-[10px] font-mono text-textTertiary mt-0.5">{award.subDetail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match-Level Awards (Player of the Match) */}
      {motmAwards.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-yellow-400" />
            <span className="text-[10px] font-mono text-textTertiary uppercase tracking-widest">
              Player of the Match × {motmAwards.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {motmAwards.map((award, idx) => (
              <div
                key={`motm-${idx}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-400/[0.06] border border-yellow-400/20 hover:border-yellow-400/40 transition-all group"
              >
                <Trophy size={12} className="text-yellow-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-textPrimary group-hover:text-yellow-400 transition-colors">
                    {award.detail}
                  </span>
                  <span className="text-[9px] font-mono text-textTertiary">{award.subDetail} · {award.impact.toFixed(1)} impact</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
