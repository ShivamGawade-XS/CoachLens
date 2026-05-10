import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Clock, Trophy, ChevronRight, Activity, Users, Target, TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { calculateSeasonForm, getTeamFormGuide } from '../../utils/seasonScoring';
import { calculateClutchFactors } from '../../utils/coachingMetrics';

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMatches = async () => {
      await storageService.seedDemoMatches();
      const fetchedMatches = await storageService.getMatches();
      setMatches(fetchedMatches);
    };
    fetchMatches();
  }, []);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const success = await storageService.deleteMatch(id);
    if (success) {
      const updatedMatches = await storageService.getMatches();
      setMatches(updatedMatches);
    }
  };

  const getResultBadge = (result) => {
    if (!result) return null;
    return result === 'Won'
      ? 'bg-aggressor-bg text-aggressor-text border border-aggressor-border'
      : 'bg-liability-bg text-liability-text border border-liability-border';
  };

  // Computed metrics
  const totalMatches = matches.length;
  const wins = matches.filter(m => m.result === 'Won').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Get teams count from localStorage
  const teamsCount = (() => {
    try {
      const data = localStorage.getItem(`coachlens_teams_${user?.id}`);
      return data ? JSON.parse(data).length : 0;
    } catch { return 0; }
  })();

  const seasonForm = React.useMemo(() => {
    return calculateSeasonForm(matches);
  }, [matches]);

  const clutchFactors = React.useMemo(() => {
    return calculateClutchFactors(matches);
  }, [matches]);

  const firstName = user?.fullName?.split(' ')[0] || 'Coach';

  const MetricCard = ({ title, value, subtitle, icon, trend, isPositive }) => (
    <div className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-textSecondary mb-2">{title}</h3>
      <div className="text-3xl font-display text-textPrimary mb-2">{value}</div>
      <div className="flex items-center gap-2 mt-auto">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isPositive ? 'bg-aggressor-bg text-aggressor-text' : 'bg-surface3 text-textTertiary'}`}>
          {trend}
        </span>
        <span className="text-[10px] text-textTertiary uppercase tracking-wider">{subtitle}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-display-xl font-display text-textPrimary mb-2">Welcome back, {firstName}</h1>
          <p className="text-textSecondary text-sm">Here is your team's operational intelligence overview.</p>
        </div>
        <button 
          onClick={() => navigate('/analyze')}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white px-6 py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
        >
          <Plus size={16} /> New Analysis
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Matches Analyzed" 
          value={totalMatches} 
          subtitle="This season" 
          icon={<Activity size={64} />} 
          trend={`${totalMatches} total`}
          isPositive={totalMatches > 0} 
        />
        <MetricCard 
          title="Win Rate" 
          value={`${winRate}%`} 
          subtitle={`${wins} won / ${totalMatches - wins} lost`}
          icon={<Trophy size={64} />} 
          trend={winRate >= 50 ? 'Winning' : 'Needs work'} 
          isPositive={winRate >= 50} 
        />
        <MetricCard 
          title="Teams Managed" 
          value={teamsCount} 
          subtitle="Active rosters" 
          icon={<Users size={64} />} 
          trend={teamsCount > 0 ? `${teamsCount} active` : 'Add a team'} 
          isPositive={teamsCount > 0} 
        />
      </div>

      {/* Season Form */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[12px] text-textSecondary uppercase tracking-[0.2em] flex items-center gap-2 font-medium">
            <Medal size={12} /> Season Form
          </h2>
        </div>

        {matches.length < 2 ? (
          <div className="glass-card rounded-2xl p-6 border border-border bg-surface2/50 flex gap-4 items-start">
            <div className="shrink-0 p-3 bg-surface3 rounded-lg text-textTertiary">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-textPrimary uppercase tracking-wider mb-1">Consistency Engine Locked</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Season Form requires at least 2 match scorecards to calculate player consistency and team trends. Upload more match data to unlock this feature.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Performers Podium */}
            {seasonForm.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {seasonForm.slice(0, Math.min(3, seasonForm.length)).map((player, idx) => (
                  <div key={idx} className={`glass-card rounded-xl p-5 border-t-[3px] animate-fade-in-up ${idx === 0 ? 'border-accent shadow-glow-amber' : idx === 1 ? 'border-textSecondary' : 'border-textTertiary'}`} style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-mono font-bold text-textTertiary uppercase tracking-widest">#{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        {player.trend === 'up' && <TrendingUp size={14} className="text-aggressor-text" />}
                        {player.trend === 'down' && <TrendingDown size={14} className="text-liability-text" />}
                        {player.trend === 'flat' && <Minus size={14} className="text-textTertiary" />}
                        <span className={`text-xl font-display font-bold ${
                          player.score >= 8 ? 'text-aggressor-text' : player.score >= 6 ? 'text-accent' : player.score >= 4 ? 'text-improving-text' : 'text-liability-text'
                        }`}>{player.score}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-display text-textPrimary truncate">{player.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] font-mono text-textSecondary uppercase">{player.role}</p>
                      <span className="text-[9px] font-mono text-textTertiary bg-surface2 px-2 py-0.5 rounded">{player.appearances} match{player.appearances !== 1 ? 'es' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Full Squad Table */}
            <div className="glass-card rounded-xl overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface2/50 border-b border-border text-[10px] uppercase font-mono tracking-wider text-textSecondary">
                      <th className="px-5 py-3.5 font-medium w-8">#</th>
                      <th className="px-5 py-3.5 font-medium">Player</th>
                      <th className="px-5 py-3.5 font-medium hidden sm:table-cell">Role</th>
                      <th className="px-5 py-3.5 font-medium text-center">Apps</th>
                      <th className="px-5 py-3.5 font-medium text-center">Trend</th>
                      <th className="px-5 py-3.5 font-medium text-center hidden md:table-cell">Clutch</th>
                      <th className="px-5 py-3.5 font-medium text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {seasonForm.map((player, idx) => {
                      const clutch = clutchFactors[player.name];
                      return (
                      <tr key={idx} className="hover:bg-surface2/30 transition-colors">
                        <td className="px-5 py-3.5 text-xs font-mono text-textTertiary">{idx + 1}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-textPrimary">
                          <Link to={`/player/${encodeURIComponent(player.name)}`} className="hover:text-accent transition-colors underline decoration-border underline-offset-2 hover:decoration-accent/50">
                            {player.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-[10px] font-mono text-textSecondary uppercase hidden sm:table-cell">{player.role}</td>
                        <td className="px-5 py-3.5 text-sm text-textSecondary text-center">{player.appearances}</td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex justify-center">
                            {player.trend === 'up' && <TrendingUp size={16} className="text-aggressor-text" />}
                            {player.trend === 'down' && <TrendingDown size={16} className="text-liability-text" />}
                            {player.trend === 'flat' && <Minus size={16} className="text-textTertiary" />}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center hidden md:table-cell">
                          {clutch && (
                            <span className={`whitespace-nowrap text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-${clutch.badgeColor}-bg text-${clutch.badgeColor}-text border border-${clutch.badgeColor}-border`}>
                              {clutch.badge}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`text-sm font-display font-bold ${
                            player.score >= 8 ? 'text-aggressor-text' : player.score >= 6 ? 'text-accent' : player.score >= 4 ? 'text-improving-text' : 'text-liability-text'
                          }`}>{player.score.toFixed(1)}</span>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Matches */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[12px] text-textSecondary uppercase tracking-[0.2em] flex items-center gap-2 font-medium">
            <Target size={12} /> Recent Analyses
          </h2>
          <button className="text-[10px] text-accent uppercase tracking-wider font-mono hover:text-accentHover">View All</button>
        </div>

        {matches.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface2 border border-border flex items-center justify-center mx-auto mb-4 text-textTertiary">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-display text-textPrimary mb-2">No data yet</h3>
            <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto">Upload your first scorecard to generate player insights and team reports.</p>
            <button 
              onClick={() => navigate('/analyze')}
              className="bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all"
            >
              Start Analysis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map((match, index) => (
              <div 
                key={match.id}
                onClick={() => navigate(`/match/${match.id}`)}
                className="group relative glass-card rounded-xl p-5 cursor-pointer flex flex-col h-full card-interactive"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs text-textTertiary">
                    <Clock size={11} /> {formatDate(match.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Form Guide */}
                    <div className="hidden sm:flex items-center gap-1">
                      {getTeamFormGuide(matches, match.id).map((res, i) => (
                        <span key={i} className={`w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded-sm ${res === 'W' ? 'bg-aggressor-bg text-aggressor-text' : 'bg-liability-bg text-liability-text'}`}>
                          {res}
                        </span>
                      ))}
                    </div>
                    {match.result && (
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ml-2 ${getResultBadge(match.result)}`}>
                        {match.result}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-base font-display mb-1 truncate text-textPrimary group-hover:text-accent transition-colors">
                    {match.teamName || 'Match Analysis'}
                  </h3>
                  {match.opponent && (
                    <p className="text-sm text-textSecondary font-mono mb-4">vs {match.opponent}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="text-xs text-textTertiary px-2 py-1 bg-surface2 rounded-md">{match.format} · {match.phase}</div>
                  <div className="w-6 h-6 rounded-full bg-surface2 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <ChevronRight size={12} className="text-textTertiary group-hover:text-white transition-colors" />
                  </div>
                </div>

                {!match.isDemo && (
                  <button
                    onClick={(e) => handleDelete(e, match.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-textTertiary hover:text-liability-text hover:bg-liability-bg opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete match"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
