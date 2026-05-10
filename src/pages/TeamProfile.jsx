import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, ChevronRight, Activity } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function TeamProfile() {
  const { teamId } = useParams();
  const teamName = decodeURIComponent(teamId);
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [roster, setRoster] = useState([]);
  const [stats, setStats] = useState({ won: 0, lost: 0, total: 0 });

  useEffect(() => {
    const loadData = async () => {
      const allMatches = await storageService.getMatches();
      const teamMatches = allMatches.filter(m => m.teamName === teamName);
      
      setMatches(teamMatches.sort((a, b) => new Date(b.date) - new Date(a.date)));

      // Calculate basic stats
      let won = 0, lost = 0;
      teamMatches.forEach(m => {
        if (m.result === 'Won') won++;
        if (m.result === 'Lost') lost++;
      });
      setStats({ won, lost, total: teamMatches.length });

      // Build Roster
      const playersMap = new Map();
      teamMatches.forEach(match => {
        if (match.analysis && match.analysis.players) {
          match.analysis.players.forEach(p => {
            if (!playersMap.has(p.name)) {
              playersMap.set(p.name, {
                name: p.name,
                role: p.role,
                appearances: 1,
                lastTag: p.tag
              });
            } else {
              const existing = playersMap.get(p.name);
              existing.appearances += 1;
              existing.lastTag = p.tag; // update to most recent tag
            }
          });
        }
      });
      setRoster(Array.from(playersMap.values()).sort((a, b) => b.appearances - a.appearances));
    };

    loadData();
  }, [teamName]);

  const getTagColor = (tag) => {
    if (tag === 'Aggressor') return 'text-aggressor-text bg-aggressor-bg border-aggressor-border';
    if (tag === 'Anchor') return 'text-anchor-text bg-anchor-bg border-anchor-border';
    if (tag === 'Liability') return 'text-liability-text bg-liability-bg border-liability-border';
    if (tag === 'Improving') return 'text-improving-text bg-improving-bg border-improving-border';
    return 'text-textSecondary bg-surface2 border-border';
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/teams')} className="p-2 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textSecondary hover:text-textPrimary transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-display-lg font-display text-textPrimary">{teamName}</h1>
          <p className="text-sm font-mono text-textSecondary">Team Profile</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl border-border">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-2 flex items-center gap-2"><Activity size={14} /> Total Matches</div>
          <div className="text-3xl font-display text-textPrimary">{stats.total}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border-aggressor-border/30">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-2 flex items-center gap-2"><Trophy size={14} className="text-aggressor-text" /> Won</div>
          <div className="text-3xl font-display text-aggressor-text">{stats.won}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border-liability-border/30">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-2 flex items-center gap-2"><Trophy size={14} className="text-liability-text" /> Lost</div>
          <div className="text-3xl font-display text-liability-text">{stats.lost}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Roster Column (Left, 2/3) */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-display text-textPrimary flex items-center gap-2">
            <Users size={18} className="text-accent" /> Active Roster
          </h2>
          
          <div className="glass-card rounded-2xl overflow-hidden">
            {roster.length === 0 ? (
              <div className="p-8 text-center text-textSecondary text-sm font-mono">No players found. Analyze a match to build the roster.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-surface2 border-b border-border">
                  <tr>
                    <th className="px-5 py-3 text-[10px] uppercase font-mono tracking-wider text-textTertiary font-medium">Player Name</th>
                    <th className="px-5 py-3 text-[10px] uppercase font-mono tracking-wider text-textTertiary font-medium">Primary Role</th>
                    <th className="px-5 py-3 text-[10px] uppercase font-mono tracking-wider text-textTertiary font-medium text-center">Matches</th>
                    <th className="px-5 py-3 text-[10px] uppercase font-mono tracking-wider text-textTertiary font-medium text-center">Recent Form</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roster.map(player => (
                    <tr key={player.name} className="hover:bg-surface2/50 transition-colors group">
                      <td className="px-5 py-4 font-display text-textPrimary">{player.name}</td>
                      <td className="px-5 py-4 text-xs font-mono text-textSecondary">{player.role}</td>
                      <td className="px-5 py-4 text-sm font-mono text-textPrimary text-center">{player.appearances}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTagColor(player.lastTag)}`}>
                          {player.lastTag}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/player/${encodeURIComponent(player.name)}`} className="inline-flex items-center gap-1 text-xs font-mono text-accent hover:text-accentHover opacity-0 group-hover:opacity-100 transition-opacity">
                          Profile <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Match History (Right, 1/3) */}
        <div className="space-y-4">
          <h2 className="text-lg font-display text-textPrimary">Recent Matches</h2>
          <div className="space-y-3">
            {matches.slice(0, 5).map(match => (
              <Link key={match.id} to={`/match/${match.id}`} className="block glass-card p-4 rounded-xl hover:border-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${match.result === 'Won' ? 'bg-aggressor-bg text-aggressor-text border-aggressor-border' : 'bg-liability-bg text-liability-text border-liability-border'}`}>
                    {match.result}
                  </span>
                  <span className="text-xs font-mono text-textTertiary">{new Date(match.date).toLocaleDateString()}</span>
                </div>
                <h4 className="font-display text-sm text-textPrimary truncate mb-1">vs {match.opponent}</h4>
                <p className="text-[10px] font-mono text-textSecondary">Format: {match.format}</p>
              </Link>
            ))}
            {matches.length === 0 && (
              <div className="text-sm font-mono text-textSecondary text-center p-4 border border-dashed border-border rounded-xl">No match history</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
