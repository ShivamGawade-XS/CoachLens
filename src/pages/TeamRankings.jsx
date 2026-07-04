import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, ArrowRight, Target, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTeams } from './AppPages';
import { storageService } from '../services/storageService';

/* ─── Ranking Algorithm ─── */
function computeRankings(teams, allMatches) {
  return teams.map(team => {
    const teamMatches = allMatches.filter(m => m.teamName === team.name);
    const total = teamMatches.length;
    const wins = teamMatches.filter(m => m.result === 'Won').length;
    const losses = total - wins;
    const winRate = total > 0 ? (wins / total) * 100 : 0;

    // Net Run Rate approximation from match impacts
    const avgImpact = total > 0
      ? teamMatches.reduce((sum, m) => {
          const players = m.analysis?.players || [];
          const matchAvg = players.length > 0
            ? players.reduce((s, p) => s + (parseFloat(p.match_impact) || 5), 0) / players.length
            : 5;
          return sum + matchAvg;
        }, 0) / total
      : 0;

    // Points system: 2 pts per win, 0 per loss
    const points = wins * 2;

    // Form: last 5 matches
    const sorted = [...teamMatches].sort((a, b) => new Date(b.date) - new Date(a.date));
    const last5 = sorted.slice(0, 5).map(m => m.result === 'Won' ? 'W' : 'L');

    // Streak
    let streak = 0;
    let streakType = null;
    for (const m of sorted) {
      if (streakType === null) {
        streakType = m.result;
        streak = 1;
      } else if (m.result === streakType) {
        streak++;
      } else {
        break;
      }
    }

    // Trend: compare last 3 win rate vs overall
    const last3 = sorted.slice(0, 3);
    const last3WinRate = last3.length > 0
      ? (last3.filter(m => m.result === 'Won').length / last3.length) * 100
      : 0;
    let trend = 'flat';
    if (last3.length >= 2) {
      if (last3WinRate > winRate + 10) trend = 'up';
      else if (last3WinRate < winRate - 10) trend = 'down';
    }

    // Best player
    const playerAccumulator = {};
    teamMatches.forEach(m => {
      (m.analysis?.players || []).forEach(p => {
        if (!playerAccumulator[p.name]) playerAccumulator[p.name] = { total: 0, count: 0 };
        playerAccumulator[p.name].total += parseFloat(p.match_impact) || 5;
        playerAccumulator[p.name].count += 1;
      });
    });
    const topPlayer = Object.entries(playerAccumulator)
      .map(([name, data]) => ({ name, avg: data.total / data.count }))
      .sort((a, b) => b.avg - a.avg)[0];

    return {
      id: team.id,
      name: team.name,
      emoji: team.emoji,
      logo: team.logo || null,
      played: total,
      wins,
      losses,
      points,
      winRate: Number(winRate.toFixed(1)),
      avgImpact: Number(avgImpact.toFixed(1)),
      form: last5,
      streak,
      streakType: streakType === 'Won' ? 'W' : streakType === 'Lost' ? 'L' : null,
      trend,
      topPlayer: topPlayer ? topPlayer.name : null,
      topPlayerAvg: topPlayer ? Number(topPlayer.avg.toFixed(1)) : null,
      rosterSize: team.roster?.length || 0,
    };
  }).sort((a, b) => {
    // Primary: points, Secondary: win rate, Tertiary: avg impact
    if (b.points !== a.points) return b.points - a.points;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    return b.avgImpact - a.avgImpact;
  });
}

const RANK_BADGES = [
  { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.15)]' },
  { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30', glow: 'shadow-[0_0_15px_rgba(148,163,184,0.1)]' },
  { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30', glow: '' },
];

export default function TeamRankings() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [allMatches, setAllMatches] = useState([]);

  useEffect(() => {
    if (!user) return;
    setTeams(getTeams(user.id));
    (async () => {
      try {
        const matches = await storageService.getMatches();
        setAllMatches(matches);
      } catch (err) {
        console.error("Failed to load matches for rankings:", err);
      }
    })();
  }, [user]);

  const rankings = useMemo(() => computeRankings(teams, allMatches), [teams, allMatches]);

  const totalMatches = allMatches.length;
  const topTeam = rankings[0];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-display-xl font-display text-textPrimary mb-2 flex items-center gap-3">
            <Trophy className="text-accent" size={28} /> Team Rankings
          </h1>
          <p className="text-textSecondary text-sm">
            Computed from match history using a points-based league system with form analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-surface2 border border-border rounded-xl">
            <BarChart3 size={14} className="text-accent" />
            <span className="text-xs font-mono text-textSecondary">
              {teams.length} Teams · {totalMatches} Matches
            </span>
          </div>
        </div>
      </div>

      {/* Hero Stats Row */}
      {topTeam && topTeam.played > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
          {/* Top Team */}
          <div className="glass-card rounded-2xl p-6 border border-yellow-400/20 shadow-[0_0_30px_rgba(250,204,21,0.08)] col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={14} className="text-yellow-400" />
              <span className="text-[10px] font-mono text-textTertiary uppercase tracking-widest">Current Leader</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                {topTeam.logo ? (
                  <img src={topTeam.logo} alt={topTeam.name} className="w-full h-full object-cover" />
                ) : (
                  topTeam.emoji
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display text-textPrimary">{topTeam.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs font-mono text-accent">{topTeam.points} PTS</span>
                  <span className="text-xs font-mono text-textSecondary">{topTeam.winRate}% WR</span>
                  <span className="text-xs font-mono text-textSecondary">{topTeam.wins}W / {topTeam.losses}L</span>
                </div>
              </div>
              {topTeam.streakType === 'W' && topTeam.streak >= 2 && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-aggressor-bg/30 border border-aggressor-border/50">
                  <Zap size={12} className="text-aggressor-text" />
                  <span className="text-[10px] font-mono font-bold text-aggressor-text">{topTeam.streak} Win Streak</span>
                </div>
              )}
            </div>
          </div>

          {/* League Summary */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-accent" />
              <span className="text-[10px] font-mono text-textTertiary uppercase tracking-widest">League Overview</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-display text-textPrimary">{teams.length}</div>
                <div className="text-[10px] font-mono text-textTertiary uppercase">Teams</div>
              </div>
              <div>
                <div className="text-2xl font-display text-textPrimary">{totalMatches}</div>
                <div className="text-[10px] font-mono text-textTertiary uppercase">Matches</div>
              </div>
              <div>
                <div className="text-2xl font-display text-accent">{topTeam.points}</div>
                <div className="text-[10px] font-mono text-textTertiary uppercase">Top Pts</div>
              </div>
              <div>
                <div className="text-2xl font-display text-textPrimary">{topTeam.winRate}%</div>
                <div className="text-[10px] font-mono text-textTertiary uppercase">Best WR</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      {rankings.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-lg font-display text-textPrimary mb-2">No rankings yet</h3>
          <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto font-mono">
            Create teams and analyze matches to generate rankings.
          </p>
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accentHover text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-glow-accent"
          >
            Go to Teams <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[56px_1fr_72px_72px_72px_80px_120px_80px_100px] gap-4 items-center px-6 py-4 bg-surface2/50 border-b border-border">
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest text-center">#</span>
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest">Team</span>
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest text-center">P</span>
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest text-center">W</span>
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest text-center">L</span>
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest text-center">Pts</span>
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest text-center">Form</span>
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest text-center">Win %</span>
            <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest text-center">Trend</span>
          </div>

          {/* Rows */}
          {rankings.map((team, idx) => {
            const badge = RANK_BADGES[idx];
            const BadgeIcon = badge?.icon;
            return (
              <Link
                key={team.id}
                to={`/teams/${encodeURIComponent(team.name)}`}
                className={`group block border-b border-border/50 last:border-b-0 transition-all duration-200 hover:bg-surface2/40 ${
                  idx === 0 ? 'bg-yellow-400/[0.02]' : ''
                }`}
              >
                {/* Desktop Row */}
                <div className="hidden md:grid grid-cols-[56px_1fr_72px_72px_72px_80px_120px_80px_100px] gap-4 items-center px-6 py-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center">
                    {badge ? (
                      <div className={`w-9 h-9 rounded-xl ${badge.bg} ${badge.border} border flex items-center justify-center ${badge.glow}`}>
                        <BadgeIcon size={16} className={badge.color} />
                      </div>
                    ) : (
                      <span className="text-lg font-display text-textTertiary">{idx + 1}</span>
                    )}
                  </div>

                  {/* Team Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface3 border border-border flex items-center justify-center text-xl shrink-0 group-hover:border-accent/30 transition-colors overflow-hidden">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        team.emoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-textPrimary truncate group-hover:text-accent transition-colors">{team.name}</div>
                      {team.topPlayer && (
                        <div className="text-[10px] font-mono text-textTertiary truncate">
                          ★ {team.topPlayer} ({team.topPlayerAvg})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Played */}
                  <div className="text-center text-sm font-mono text-textSecondary">{team.played}</div>

                  {/* Won */}
                  <div className="text-center text-sm font-mono text-aggressor-text font-bold">{team.wins}</div>

                  {/* Lost */}
                  <div className="text-center text-sm font-mono text-liability-text">{team.losses}</div>

                  {/* Points */}
                  <div className="text-center">
                    <span className="text-sm font-mono font-bold text-accent">{team.points}</span>
                  </div>

                  {/* Form */}
                  <div className="flex items-center justify-center gap-1">
                    {team.form.length > 0 ? team.form.map((res, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold ${
                          res === 'W'
                            ? 'bg-aggressor-bg text-aggressor-text border border-aggressor-border'
                            : 'bg-liability-bg text-liability-text border border-liability-border'
                        }`}
                      >
                        {res}
                      </span>
                    )) : (
                      <span className="text-[10px] font-mono text-textTertiary">—</span>
                    )}
                  </div>

                  {/* Win Rate */}
                  <div className="text-center">
                    <span className={`text-sm font-mono font-bold ${
                      team.winRate >= 60 ? 'text-aggressor-text' :
                      team.winRate >= 40 ? 'text-improving-text' :
                      'text-liability-text'
                    }`}>
                      {team.played > 0 ? `${team.winRate}%` : '—'}
                    </span>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center justify-center gap-1.5">
                    {team.trend === 'up' && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-aggressor-bg/30 border border-aggressor-border/50">
                        <TrendingUp size={12} className="text-aggressor-text" />
                        <span className="text-[10px] font-mono font-bold text-aggressor-text">Rise</span>
                      </div>
                    )}
                    {team.trend === 'down' && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-liability-bg/30 border border-liability-border/50">
                        <TrendingDown size={12} className="text-liability-text" />
                        <span className="text-[10px] font-mono font-bold text-liability-text">Drop</span>
                      </div>
                    )}
                    {team.trend === 'flat' && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface3 border border-border">
                        <Minus size={12} className="text-textTertiary" />
                        <span className="text-[10px] font-mono font-bold text-textTertiary">Flat</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden px-5 py-4 flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0 w-10">
                    {badge ? (
                      <div className={`w-8 h-8 rounded-lg ${badge.bg} ${badge.border} border flex items-center justify-center`}>
                        <BadgeIcon size={14} className={badge.color} />
                      </div>
                    ) : (
                      <span className="text-lg font-display text-textTertiary">{idx + 1}</span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-surface3 border border-border flex items-center justify-center text-lg shrink-0 overflow-hidden">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      team.emoji
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-textPrimary truncate">{team.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono text-accent font-bold">{team.points} PTS</span>
                      <span className="text-[10px] font-mono text-textTertiary">{team.wins}W {team.losses}L</span>
                      <span className={`text-[10px] font-mono font-bold ${
                        team.winRate >= 60 ? 'text-aggressor-text' : team.winRate >= 40 ? 'text-improving-text' : 'text-liability-text'
                      }`}>{team.played > 0 ? `${team.winRate}%` : '—'}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {team.form.map((res, i) => (
                        <span key={i} className={`w-4 h-4 flex items-center justify-center rounded text-[8px] font-mono font-bold ${
                          res === 'W' ? 'bg-aggressor-bg text-aggressor-text border border-aggressor-border' : 'bg-liability-bg text-liability-text border border-liability-border'
                        }`}>{res}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    {team.trend === 'up' && <TrendingUp size={16} className="text-aggressor-text" />}
                    {team.trend === 'down' && <TrendingDown size={16} className="text-liability-text" />}
                    {team.trend === 'flat' && <Minus size={16} className="text-textTertiary" />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {rankings.length > 0 && (
        <div className="flex flex-wrap items-center gap-6 px-2 animate-fade-in">
          <span className="text-[10px] font-mono text-textTertiary uppercase tracking-widest">Legend:</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-textTertiary">P = Played</span>
            <span className="text-[10px] font-mono text-textTertiary">·</span>
            <span className="text-[10px] font-mono text-textTertiary">W = Won</span>
            <span className="text-[10px] font-mono text-textTertiary">·</span>
            <span className="text-[10px] font-mono text-textTertiary">L = Lost</span>
            <span className="text-[10px] font-mono text-textTertiary">·</span>
            <span className="text-[10px] font-mono text-textTertiary">Pts = 2 per Win</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown size={10} className="text-yellow-400" />
            <span className="text-[10px] font-mono text-textTertiary">1st</span>
            <Medal size={10} className="text-slate-300" />
            <span className="text-[10px] font-mono text-textTertiary">2nd</span>
            <Award size={10} className="text-amber-600" />
            <span className="text-[10px] font-mono text-textTertiary">3rd</span>
          </div>
        </div>
      )}
    </div>
  );
}
