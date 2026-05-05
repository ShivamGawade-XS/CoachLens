import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import ScoreboardInput from './components/ScoreboardInput/ScoreboardInput';
import PlayerCard from './components/PlayerCard/PlayerCard';
import TeamReport from './components/TeamReport/TeamReport';
import CoachBrief from './components/CoachBrief/CoachBrief';
import { groqService } from './services/groqService';
import { storageService } from './services/storageService';
import { ChevronLeft } from 'lucide-react';

function App() {
  const [view, setView] = useState('dashboard'); // dashboard | input | loading | results
  const [currentMatch, setCurrentMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('players'); // players | team | brief

  const handleNewAnalysis = () => {
    setView('input');
  };

  const handleViewMatch = (match) => {
    setCurrentMatch(match);
    setView('results');
    setActiveTab('players');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentMatch(null);
  };

  const runAnalysis = async (format, phase, scorecardText) => {
    setView('loading');
    try {
      const analysisData = await groqService.analyze(format, phase, scorecardText);
      
      const newMatchRecord = {
        format,
        phase,
        rawScorecard: scorecardText,
        analysis: analysisData
      };
      
      const savedMatch = storageService.saveMatch(newMatchRecord);
      setCurrentMatch(savedMatch);
      setView('results');
      setActiveTab('players');
    } catch (error) {
      console.error("Analysis failed:", error);
      // Fallback already handled in groqService, but just in case
      alert("An error occurred during analysis. Please try again.");
      setView('input');
    }
  };

  if (view === 'dashboard') {
    return <Dashboard onNewAnalysis={handleNewAnalysis} onViewMatch={handleViewMatch} />;
  }

  if (view === 'input') {
    return <ScoreboardInput onAnalyze={runAnalysis} onBack={handleBackToDashboard} />;
  }

  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
        <div className="w-16 h-16 relative mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-border"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin"></div>
        </div>
        <h2 className="text-display-lg font-display mb-8 animate-pulse text-textPrimary">Analyzing match...</h2>
        <div className="space-y-3 text-textSecondary font-mono text-sm max-w-sm text-center">
          <p className="animate-[fade-in_1.5s_ease-in-out]">Running player pattern analysis</p>
          <p className="animate-[fade-in_3s_ease-in-out]">Identifying team scoring trends</p>
          <p className="animate-[fade-in_4.5s_ease-in-out]">Building coach decision brief</p>
        </div>
      </div>
    );
  }

  if (view === 'results' && currentMatch) {
    const { analysis } = currentMatch;

    return (
      <div className="min-h-screen bg-primary pb-12">
        <header className="bg-surface1 border-b border-border sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="py-4 flex items-center">
              <button 
                onClick={handleBackToDashboard}
                className="text-textSecondary hover:text-textPrimary flex items-center text-sm mr-6"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <h1 className="font-display text-xl truncate">Match Analysis</h1>
            </div>
            
            <nav className="flex space-x-8">
              {['players', 'team', 'brief'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm tracking-wider uppercase font-medium border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-accent text-textPrimary' 
                      : 'border-transparent text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {tab === 'players' ? 'Players' : tab === 'team' ? 'Team Report' : 'Coach Brief'}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
          {activeTab === 'players' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.players && analysis.players.map((player, idx) => (
                <div key={idx} className="animate-[fade-in-up_0.3s_ease-out_forwards]" style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}>
                  <PlayerCard player={player} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="animate-[fade-in_0.3s_ease-out]">
              <TeamReport report={analysis.team_summary} />
            </div>
          )}

          {activeTab === 'brief' && (
            <div className="animate-[fade-in_0.3s_ease-out]">
              <CoachBrief brief={analysis.coach_decisions} />
            </div>
          )}
        </main>
      </div>
    );
  }

  return null;
}

export default App;
