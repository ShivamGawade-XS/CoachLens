import React, { useEffect, useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function Dashboard({ onNewAnalysis, onViewMatch }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    setMatches(storageService.getMatches());
  }, []);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-primary">
      {/* Sidebar / Match History */}
      <div className="w-full md:w-80 border-r border-border bg-surface1 flex flex-col">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h1 className="font-display text-xl tracking-tight">COACHLENS</h1>
          <button className="text-textSecondary hover:text-textPrimary" title="Settings">
            <Settings size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            <h2 className="text-[10px] text-textSecondary uppercase tracking-[0.2em] mb-4">Match History</h2>
            
            {matches.length === 0 ? (
              <p className="text-sm text-textTertiary">No matches analyzed yet.</p>
            ) : (
              <div className="space-y-2">
                {matches.map(match => (
                  <div 
                    key={match.id}
                    onClick={() => onViewMatch(match)}
                    className="p-3 rounded border border-transparent hover:border-border hover:bg-surface2 cursor-pointer transition-colors"
                  >
                    <div className="text-xs text-textSecondary mb-1">{formatDate(match.date)}</div>
                    <div className="text-sm font-medium mb-1 truncate">Match Analysis</div>
                    <div className="text-xs text-textTertiary">{match.format} · {match.phase}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-border">
          <button 
            onClick={onNewAnalysis}
            className="w-full flex items-center justify-center bg-surface2 hover:bg-border text-textPrimary border border-border rounded py-2 text-sm transition-colors"
          >
            <Plus size={16} className="mr-2" /> New Analysis
          </button>
        </div>
      </div>

      {/* Main Panel - Empty State for Desktop */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-primary">
        <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-6">
          <div className="w-8 h-8 border-t-2 border-l-2 border-accent transform rotate-45"></div>
        </div>
        <h2 className="text-xl font-display mb-2">No match selected</h2>
        <p className="text-textSecondary text-sm mb-8 max-w-md">
          Select a match from your history to view its post-match analysis, or paste a new scorecard to generate a fresh coaching brief.
        </p>
        <button 
          onClick={onNewAnalysis}
          className="bg-accent hover:bg-accentHover text-primary font-mono font-bold px-6 py-3 text-sm uppercase tracking-wider transition-colors"
        >
          + New Analysis
        </button>
      </div>
    </div>
  );
}
