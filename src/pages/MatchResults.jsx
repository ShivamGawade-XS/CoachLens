import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { storageService } from '../services/storageService';
import PlayerCard from '../components/PlayerCard/PlayerCard';
import TeamReport from '../components/TeamReport/TeamReport';
import CoachBrief from '../components/CoachBrief/CoachBrief';

export default function MatchResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    const matches = storageService.getMatches();
    const found = matches.find(m => m.id === id);
    if (found) {
      setMatch(found);
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  if (!match) return null;

  const tabs = [
    { key: 'players', label: 'Players', icon: '👤' },
    { key: 'team', label: 'Team Report', icon: '📊' },
    { key: 'brief', label: 'Coach Brief', icon: '📋' },
  ];

  return (
    <div className="min-h-full">
      {/* Sticky Header */}
      <header className="glass border-b border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center">
            <Link 
              to="/dashboard"
              className="text-textSecondary hover:text-textPrimary flex items-center text-sm mr-6 group transition-colors"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl truncate text-textPrimary">
                {match.teamName || 'Match Analysis'}
                {match.opponent && (
                  <span className="text-textSecondary font-mono text-sm ml-2">vs {match.opponent}</span>
                )}
              </h1>
            </div>
            {match.result && (
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ml-3 border ${
                match.result === 'Won' 
                  ? 'bg-aggressor-bg text-aggressor-text border-aggressor-border' 
                  : 'bg-liability-bg text-liability-text border-liability-border'
              }`}>
                {match.result}
              </span>
            )}
          </div>
          
          {/* Tab Navigation */}
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 pb-3 pt-1 text-sm tracking-wider uppercase font-medium border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.key 
                    ? 'border-accent text-textPrimary' 
                    : 'border-transparent text-textSecondary hover:text-textPrimary'
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {activeTab === 'players' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {match.analysis.players && match.analysis.players.map((player, idx) => (
              <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}>
                <PlayerCard player={player} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="animate-fade-in">
            <TeamReport report={match.analysis.team_summary} />
          </div>
        )}

        {activeTab === 'brief' && (
          <div className="animate-fade-in">
            <CoachBrief brief={match.analysis.coach_decisions} />
          </div>
        )}
      </div>
    </div>
  );
}
