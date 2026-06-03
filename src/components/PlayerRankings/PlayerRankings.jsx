import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Medal, Award, TrendingUp, TrendingDown, Minus, ChevronRight, Target, Zap, Shield, Crosshair } from 'lucide-react';

const TAG_SCORES = { 'Aggressor': 8, 'Anchor': 7.5, 'Improving': 6, 'Liability': 4 };

const ROLE_FILTERS = [
  { key: 'all', label: 'All', icon: null },
  { key: 'Batsman', label: 'Batsmen', icon: '🏏' },
  { key: 'Bowler', label: 'Bowlers', icon: '🎯' },
  { key: 'Allrounder', label: 'All-rounders', icon: '⚡' },
  { key: 'Wicketkeeper', label: 'Keepers', icon: '🧤' },
];

function computePlayerRankings(matches, roster) {
  const playerData = {};

  // First, seed from roster so all players appear
  (roster || []).forEach(p => {
    playerData[p.name] = {
      name: p.name,
      role: p.role || 'Unknown',
      appearances: 0,
      totalImpact: 0,
      scores: [],
      tags: [],
      lastTag: 'Untested',
      keyStat: null,
      whatWorked: null,
    };
  });

  // Then, accumulate from match data
  const sorted = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
  sorted.forEach(match => {
    (match.analysis?.players || []).forEach(p => {
      if (!playerData[p.name]) {
        playerData[p.name] = {
          name: p.name,
          role: p.role || 'Unknown',
          appearances: 0,
          totalImpact: 0,
          scores: [],
          tags: [],
          lastTag: p.tag || 'Untested',
          keyStat: p.key_stat || null,
          whatWorked: p.what_worked || null,
        };
      }
      const impact = parseFloat(p.match_impact) || TAG_SCORES[p.tag] || 5;
      playerData[p.name].appearances += 1;
      playerData[p.name].totalImpact += impact;
      playerData[p.name].scores.push(impact);
      playerData[p.name].tags.push(p.tag);
      playerData[p.name].lastTag = p.tag || playerData[p.name].lastTag;
      playerData[p.name].keyStat = p.key_stat || playerData[p.name].keyStat;
      playerData[p.name].whatWorked = p.what_worked || playerData[p.name].whatWorked;
      // Keep role from match analysis if more specific
      if (p.role && p.role !== 'Unknown') playerData[p.name].role = p.role;
    });
  });

  return Object.values(playerData).map(p => {
    const avg = p.appearances > 0 ? p.totalImpact / p.appearances : 0;

    // Trend: compare last 2 scores vs overall average
    let trend = 'flat';
    if (p.scores.length >= 3) {
      const last2Avg = (p.scores.slice(-2).reduce((s, v) => s + v, 0)) / 2;
      if (last2Avg > avg + 0.5) trend = 'up';
      else if (last2Avg < avg - 0.5) trend = 'down';
    }

    // Consistency: standard deviation of scores
    let consistency = 0;
    if (p.scores.length >= 2) {
      const mean = p.totalImpact / p.scores.length;
      const variance = p.scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / p.scores.length;
      consistency = Math.sqrt(variance);
    }

    // Tag distribution
    const tagCounts = {};
    p.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    const dominantTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      name: p.name,
      role: p.role,
      appearances: p.appearances,
      avgImpact: Number(avg.toFixed(1)),
      trend,
      consistency: Number(consistency.toFixed(2)),
      lastTag: p.lastTag,
      keyStat: p.keyStat,
      whatWorked: p.whatWorked,
      dominantTag: dominantTag ? dominantTag[0] : null,
      tagCounts,
      scores: p.scores,
    };
  }).sort((a, b) => {
    // Sort by avg impact, then by appearances as tiebreaker
    if (b.avgImpact !== a.avgImpact) return b.avgImpact - a.avgImpact;
    return b.appearances - a.appearances;
  });
}

const RANK_BADGES = [
  { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30' },
  { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30' },
];

function getTagColor(tag) {
  if (tag === 'Aggressor') return 'text-aggressor-text bg-aggressor-bg border-aggressor-border';
  if (tag === 'Anchor') return 'text-anchor-text bg-anchor-bg border-anchor-border';
  if (tag === 'Liability') return 'text-liability-text bg-liability-bg border-liability-border';
  if (tag === 'Improving') return 'text-improving-text bg-improving-bg border-improving-border';
  return 'text-textTertiary bg-surface2 border-border';
}

export default function PlayerRankings({ matches, roster }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const allRankings = useMemo(() => computePlayerRankings(matches, roster), [matches, roster]);
  
  const filteredRankings = useMemo(() => {
    if (activeFilter === 'all') return allRankings;
    return allRankings.filter(p => p.role === activeFilter);
  }, [allRankings, activeFilter]);

  const maxImpact = useMemo(() => {
    return filteredRankings.length > 0 ? Math.max(...filteredRankings.map(p => p.avgImpact), 1) : 10;
  }, [filteredRankings]);

  if (allRankings.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-display text-textPrimary flex items-center gap-2">
          <Target size={18} className="text-accent" /> Player Rankings
        </h2>
        <div className="text-[10px] font-mono text-textTertiary">
          Ranked by avg. match impact across {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* Role Filters */}
      <div className="flex flex-wrap gap-2">
        {ROLE_FILTERS.map(f => {
          const count = f.key === 'all' ? allRankings.length : allRankings.filter(p => p.role === f.key).length;
          if (count === 0 && f.key !== 'all') return null;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition-all duration-200 border ${
                activeFilter === f.key
                  ? 'bg-accent/10 text-accent border-accent/30 shadow-[0_0_12px_rgba(232,160,32,0.1)]'
                  : 'bg-surface2 text-textSecondary border-border hover:border-borderHover hover:text-textPrimary'
              }`}
            >
              {f.icon && <span className="text-sm">{f.icon}</span>}
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${
                activeFilter === f.key ? 'bg-accent/20 text-accent' : 'bg-surface3 text-textTertiary'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Rankings List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {filteredRankings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-mono text-textSecondary">No players found for this role filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredRankings.map((player, idx) => {
              const badge = RANK_BADGES[idx];
              const BadgeIcon = badge?.icon;
              const barWidth = maxImpact > 0 ? (player.avgImpact / maxImpact) * 100 : 0;

              return (
                <Link
                  key={player.name}
                  to={`/player/${encodeURIComponent(player.name)}`}
                  className={`group block px-5 py-4 transition-all duration-200 hover:bg-surface2/40 ${
                    idx === 0 ? 'bg-yellow-400/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="shrink-0 w-9 flex items-center justify-center">
                      {badge ? (
                        <div className={`w-8 h-8 rounded-lg ${badge.bg} ${badge.border} border flex items-center justify-center`}>
                          <BadgeIcon size={14} className={badge.color} />
                        </div>
                      ) : (
                        <span className="text-base font-display text-textTertiary">{idx + 1}</span>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-textPrimary truncate group-hover:text-accent transition-colors">
                          {player.name}
                        </span>
                        <span className="text-[9px] font-mono text-textTertiary uppercase tracking-widest shrink-0">
                          {player.role}
                        </span>
                        {player.trend === 'up' && <TrendingUp size={12} className="text-aggressor-text shrink-0" />}
                        {player.trend === 'down' && <TrendingDown size={12} className="text-liability-text shrink-0" />}
                        {player.trend === 'flat' && player.appearances > 0 && <Minus size={12} className="text-textTertiary shrink-0" />}
                      </div>

                      {/* Visual Impact Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              player.avgImpact >= 7.5 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                              player.avgImpact >= 6 ? 'bg-gradient-to-r from-accent to-amber-500' :
                              player.avgImpact >= 4.5 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                              'bg-gradient-to-r from-red-500 to-red-400'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className={`text-sm font-mono font-bold shrink-0 w-10 text-right ${
                          player.avgImpact >= 7.5 ? 'text-yellow-400' :
                          player.avgImpact >= 6 ? 'text-accent' :
                          player.avgImpact >= 4.5 ? 'text-anchor-text' :
                          'text-liability-text'
                        }`}>
                          {player.avgImpact > 0 ? player.avgImpact : '—'}
                        </span>
                      </div>

                      {/* Bottom meta row */}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-textTertiary">
                          {player.appearances} app{player.appearances !== 1 ? 's' : ''}
                        </span>
                        {player.keyStat && (
                          <span className="text-[10px] font-mono text-textSecondary">
                            {player.keyStat}
                          </span>
                        )}
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${getTagColor(player.lastTag)}`}>
                          {player.lastTag}
                        </span>
                        {/* Mini sparkline: last 5 scores */}
                        {player.scores.length >= 2 && (
                          <div className="flex items-end gap-px h-3 ml-auto">
                            {player.scores.slice(-5).map((s, i) => (
                              <div
                                key={i}
                                className={`w-1.5 rounded-full ${
                                  s >= 7 ? 'bg-aggressor-text' : s >= 5 ? 'bg-accent' : 'bg-liability-text'
                                }`}
                                style={{ height: `${Math.max((s / 10) * 100, 15)}%` }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight size={16} className="text-textTertiary group-hover:text-accent transition-colors shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredRankings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface2/50 rounded-xl p-3 border border-border text-center">
            <div className="text-[9px] font-mono text-textTertiary uppercase tracking-widest mb-1">Highest Impact</div>
            <div className="text-lg font-display text-yellow-400">{filteredRankings[0]?.avgImpact || '—'}</div>
            <div className="text-[10px] font-mono text-textSecondary truncate">{filteredRankings[0]?.name}</div>
          </div>
          <div className="bg-surface2/50 rounded-xl p-3 border border-border text-center">
            <div className="text-[9px] font-mono text-textTertiary uppercase tracking-widest mb-1">Team Average</div>
            <div className="text-lg font-display text-accent">
              {(filteredRankings.filter(p => p.appearances > 0).reduce((s, p) => s + p.avgImpact, 0) / Math.max(filteredRankings.filter(p => p.appearances > 0).length, 1)).toFixed(1)}
            </div>
            <div className="text-[10px] font-mono text-textSecondary">Impact Score</div>
          </div>
          <div className="bg-surface2/50 rounded-xl p-3 border border-border text-center">
            <div className="text-[9px] font-mono text-textTertiary uppercase tracking-widest mb-1">Rising</div>
            <div className="text-lg font-display text-aggressor-text">{filteredRankings.filter(p => p.trend === 'up').length}</div>
            <div className="text-[10px] font-mono text-textSecondary">Players</div>
          </div>
          <div className="bg-surface2/50 rounded-xl p-3 border border-border text-center">
            <div className="text-[9px] font-mono text-textTertiary uppercase tracking-widest mb-1">Declining</div>
            <div className="text-lg font-display text-liability-text">{filteredRankings.filter(p => p.trend === 'down').length}</div>
            <div className="text-[10px] font-mono text-textSecondary">Players</div>
          </div>
        </div>
      )}
    </div>
  );
}
