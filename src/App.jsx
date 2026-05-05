import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import ScoreboardInput from './components/ScoreboardInput/ScoreboardInput';
import PlayerCard from './components/PlayerCard/PlayerCard';
import TeamReport from './components/TeamReport/TeamReport';
import CoachBrief from './components/CoachBrief/CoachBrief';
import { groqService } from './services/groqService';
import { storageService } from './services/storageService';
import { ChevronLeft, X, AlertCircle, CheckCircle, Info } from 'lucide-react';

/* ─── Toast System ─── */
function Toast({ message, type = 'info', onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 200);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-aggressor-border bg-aggressor-bg text-aggressor-text',
    error: 'border-liability-border bg-liability-bg text-liability-text',
    warning: 'border-improving-border bg-improving-bg text-improving-text',
    info: 'border-anchor-border bg-anchor-bg text-anchor-text',
  };

  const icons = {
    success: <CheckCircle size={15} />,
    error: <AlertCircle size={15} />,
    warning: <AlertCircle size={15} />,
    info: <Info size={15} />,
  };

  return (
    <div className={`${exiting ? 'toast-exit' : 'toast'} flex items-center gap-3 px-4 py-3 rounded-xl border glass ${colors[type]} max-w-sm shadow-card`}>
      {icons[type]}
      <span className="text-sm font-mono flex-1">{message}</span>
      <button onClick={() => { setExiting(true); setTimeout(onClose, 200); }} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}

/* ─── Loading Screen ─── */
function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const steps = [
    'Running player pattern analysis',
    'Identifying team scoring trends',
    'Building coach decision brief',
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000;
    
    const progressInterval = setInterval(() => {
      const el = Date.now() - startTime;
      const pct = Math.min((el / duration) * 100, 98);
      setProgress(pct);
      setElapsed(Math.floor(el / 1000));
    }, 50);

    const stepTimers = steps.map((_, i) =>
      setTimeout(() => setActiveStep(i + 1), (i + 1) * 800)
    );

    return () => {
      clearInterval(progressInterval);
      stepTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary relative">
      <div className="ambient-gradient" />
      
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        {/* Spinner */}
        <div className="w-20 h-20 relative mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-3 rounded-full border border-border" />
          <div className="absolute inset-3 rounded-full border-t border-accent/50 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-[50%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent/30 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-display-lg font-display mb-6 text-textPrimary text-center">Analyzing match...</h2>
        
        {/* Steps */}
        <div className="space-y-3 w-full mb-8">
          {steps.map((step, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 text-sm font-mono transition-all duration-500 ${
                i < activeStep ? 'text-textPrimary' : 'text-textTertiary'
              }`}
              style={{
                opacity: i < activeStep ? 1 : 0.3,
                transform: i < activeStep ? 'translateX(0)' : 'translateX(8px)',
                transition: 'all 0.4s ease-out',
              }}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                i < activeStep ? 'bg-accent/20 border border-accent/40' : 'border border-border'
              }`}>
                {i < activeStep && (
                  <div className="w-2 h-2 rounded-full bg-accent animate-scale-pop" />
                )}
              </div>
              {step}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface2 rounded-full h-2 overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-accent to-accentHover rounded-full transition-all duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <span className="text-xs text-textTertiary font-mono">{elapsed}s elapsed</span>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
function App() {
  const [view, setView] = useState('dashboard');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('players');
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

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
      addToast('Analysis complete — coaching brief ready', 'success');
    } catch (error) {
      console.error("Analysis failed:", error);
      addToast('Analysis failed. Using cached demo data.', 'warning');
      setView('input');
    }
  };

  const tabs = [
    { key: 'players', label: 'Players', icon: '👤' },
    { key: 'team', label: 'Team Report', icon: '📊' },
    { key: 'brief', label: 'Coach Brief', icon: '📋' },
  ];

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Views */}
      {view === 'dashboard' && (
        <Dashboard onNewAnalysis={handleNewAnalysis} onViewMatch={handleViewMatch} />
      )}

      {view === 'input' && (
        <ScoreboardInput onAnalyze={runAnalysis} onBack={handleBackToDashboard} />
      )}

      {view === 'loading' && <LoadingScreen />}

      {view === 'results' && currentMatch && (
        <div className="min-h-screen bg-primary relative">
          <div className="ambient-gradient" />
          
          {/* Header */}
          <header className="glass border-b border-border sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="py-4 flex items-center">
                <button 
                  onClick={handleBackToDashboard}
                  className="text-textSecondary hover:text-textPrimary flex items-center text-sm mr-6 group transition-colors"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="font-display text-xl truncate">
                    {currentMatch.teamName || 'Match Analysis'}
                    {currentMatch.opponent && (
                      <span className="text-textSecondary font-mono text-sm ml-2">vs {currentMatch.opponent}</span>
                    )}
                  </h1>
                </div>
                {currentMatch.result && (
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ml-3 border ${
                    currentMatch.result === 'Won' 
                      ? 'bg-aggressor-bg text-aggressor-text border-aggressor-border' 
                      : 'bg-liability-bg text-liability-text border-liability-border'
                  }`}>
                    {currentMatch.result}
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
          <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16 relative z-10">
            {activeTab === 'players' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentMatch.analysis.players && currentMatch.analysis.players.map((player, idx) => (
                  <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}>
                    <PlayerCard player={player} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="animate-fade-in">
                <TeamReport report={currentMatch.analysis.team_summary} />
              </div>
            )}

            {activeTab === 'brief' && (
              <div className="animate-fade-in">
                <CoachBrief brief={currentMatch.analysis.coach_decisions} />
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}

export default App;
