import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Clock, Trophy, ChevronRight } from 'lucide-react';
import { storageService } from '../../services/storageService';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

export default function Dashboard({ onNewAnalysis, onViewMatch }) {
  const [matches, setMatches] = useState([]);

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

  const MatchItem = ({ match, index }) => (
    <div 
      onClick={() => onViewMatch(match)}
      className="group relative glass-card rounded-xl p-4 cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-textTertiary">
          <Clock size={11} />
          {formatDate(match.date)}
        </div>
        {match.result && (
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${getResultBadge(match.result)}`}>
            {match.result}
          </span>
        )}
      </div>
      
      <div className="text-sm font-medium mb-1 truncate text-textPrimary group-hover:text-accent transition-colors">
        {match.teamName || 'Match Analysis'}
        {match.opponent && (
          <span className="text-textSecondary font-normal"> vs {match.opponent}</span>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-textTertiary">{match.format} · {match.phase}</div>
        <ChevronRight size={14} className="text-textTertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>

      {!match.isDemo && (
        <button
          onClick={(e) => handleDelete(e, match.id)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-textTertiary hover:text-liability-text hover:bg-liability-bg opacity-0 group-hover:opacity-100 transition-all"
          title="Delete match"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-primary relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="ambient-gradient" />

      {/* ── Sidebar (Desktop) ── */}
      <div className="hidden md:flex w-80 border-r border-border glass flex-col relative z-10">
        {/* Brand Header */}
        <div className="p-5 border-b border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/logo.png" alt="CoachLens" className="h-10 object-contain dark:brightness-100 brightness-0" />
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Match History List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <h2 className="text-[10px] text-textSecondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Trophy size={10} />
              Match History
            </h2>
            
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-textTertiary">No matches analyzed yet.</p>
                <p className="text-xs text-textTertiary mt-1">Paste a scorecard to start.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <MatchItem key={match.id} match={match} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New Analysis Button */}
        <div className="p-4 border-t border-border">
          <button 
            onClick={onNewAnalysis}
            className="w-full flex items-center justify-center bg-accent hover:bg-accentHover text-white font-mono font-bold py-3 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber"
          >
            <Plus size={16} className="mr-2" /> New Analysis
          </button>
        </div>
      </div>

      {/* ── Main Panel (Desktop) ── */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center relative z-10">
        {/* Cricket stumps icon */}
        <div className="w-24 h-24 rounded-2xl glass flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-2xl animate-pulse-glow" />
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none" className="relative z-10">
            <rect x="10" y="4" width="2.5" height="20" rx="1" fill="rgb(var(--color-accent))" opacity="0.8"/>
            <rect x="15" y="4" width="2.5" height="20" rx="1" fill="rgb(var(--color-accent))"/>
            <rect x="20" y="4" width="2.5" height="20" rx="1" fill="rgb(var(--color-accent))" opacity="0.8"/>
            <rect x="9" y="6" width="15" height="2" rx="1" fill="rgb(var(--color-accent))" opacity="0.5"/>
            <rect x="9" y="10" width="15" height="2" rx="1" fill="rgb(var(--color-accent))" opacity="0.5"/>
          </svg>
        </div>
        
        <h2 className="text-2xl font-display mb-3 text-textPrimary">No match selected</h2>
        <p className="text-textSecondary text-sm mb-8 max-w-md leading-relaxed">
          Select a match from your history to view its post-match analysis, or paste a new scorecard to generate a fresh coaching brief.
        </p>
        <button 
          onClick={onNewAnalysis}
          className="bg-accent hover:bg-accentHover text-white font-mono font-bold px-8 py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber"
        >
          + New Analysis
        </button>
      </div>

      {/* ── Mobile Layout ── */}
      <div className="flex md:hidden flex-col w-full relative z-10">
        {/* Mobile Header */}
        <div className="p-4 border-b border-border glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/logo.png" alt="CoachLens" className="h-8 object-contain dark:brightness-100 brightness-0" />
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <button 
              onClick={onNewAnalysis}
              className="w-full flex items-center justify-center bg-accent hover:bg-accentHover text-white font-mono font-bold py-4 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber"
            >
              <Plus size={16} className="mr-2" /> New Analysis
            </button>
          </div>

          <h2 className="text-[10px] text-textSecondary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Trophy size={10} />
            Match History
          </h2>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-textTertiary">No matches analyzed yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((match, index) => (
                <MatchItem key={match.id} match={match} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
