import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, Trophy, ChevronRight, Activity, Users, Target } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    storageService.seedDemoMatches();
    setMatches(storageService.getMatches());
  }, []);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (storageService.deleteMatch(id)) {
      setMatches(storageService.getMatches());
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
                  {match.result && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${getResultBadge(match.result)}`}>
                      {match.result}
                    </span>
                  )}
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
