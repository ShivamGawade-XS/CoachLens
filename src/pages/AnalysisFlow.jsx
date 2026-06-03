import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreboardInput from '../components/ScoreboardInput/ScoreboardInput';
import { groqService } from '../services/groqService';
import { storageService } from '../services/storageService';
import { FALLBACK_ANALYSES } from '../utils/fallbackData';

function LoadingScreen({ elapsed, progress, activeStep, steps }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10">
      <div className="flex flex-col items-center max-w-sm w-full px-6">
        <div className="w-20 h-20 relative mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-3 rounded-full border border-border" />
          <div className="absolute inset-3 rounded-full border-t border-accent/50 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-[50%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent/30 animate-pulse" />
        </div>
        <h2 className="text-display-lg font-display mb-6 text-textPrimary text-center">Analyzing match...</h2>
        <div className="space-y-3 w-full mb-8">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm font-mono transition-all duration-500 ${i <= activeStep ? 'text-textPrimary' : 'text-textTertiary'}`} style={{ opacity: i <= activeStep ? 1 : 0.3, transform: i <= activeStep ? 'translateX(0)' : 'translateX(8px)' }}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 relative transition-all duration-300 ${
                i < activeStep 
                  ? 'bg-aggressor-text/20 border border-aggressor-text/40 text-aggressor-text' 
                  : i === activeStep 
                    ? 'bg-accent/20 border border-accent/40 text-accent' 
                    : 'border border-border'
              }`}>
                {i < activeStep ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === activeStep ? (
                  <div className="relative flex items-center justify-center w-2 h-2">
                    <div className="absolute w-2 h-2 rounded-full bg-accent animate-ping" />
                    <div className="relative w-2 h-2 rounded-full bg-accent" />
                  </div>
                ) : null}
              </div>
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-surface2 rounded-full h-2 overflow-hidden mb-1">
          <div className="h-full bg-gradient-to-r from-aggressor-text to-aggressor-text rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="w-full flex justify-between mt-2">
          <span className="text-[10px] text-textTertiary font-mono uppercase tracking-wider">
            {activeStep < steps.length ? steps[activeStep] : 'Analysis complete'}
          </span>
          <span className="text-xs text-textTertiary font-mono">{elapsed.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisFlow({ addToast }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const navigate = useNavigate();

  const steps = [
    'Reading scorecard...',
    'Building player profiles...',
    'Analysing team patterns...',
    'Writing coaching brief...',
  ];

  const handleBack = () => navigate('/dashboard');

  const runAnalysis = async (format, phase, scorecardText) => {
    setIsAnalyzing(true);
    const startTime = Date.now();
    let analysisData;
    
    // Timer to update elapsed seconds UI smoothly and advance steps every 6s
    const timerInterval = setInterval(() => {
      const sec = (Date.now() - startTime) / 1000;
      setElapsed(sec);
      
      const step = Math.min(Math.floor(sec / 6), 3);
      setActiveStep(step);
      
      const pct = Math.min((sec / 24) * 100, 99);
      setProgress(pct);
    }, 100);

    try {
      analysisData = await groqService.analyze(scorecardText, format, phase, 'Direct');
    } catch (error) {
      console.error("Analysis failed:", error);
      clearInterval(timerInterval);
      setIsAnalyzing(false);
      addToast(`Analysis Error: ${error.message}`, 'error');
      return;
    }

    clearInterval(timerInterval);
    setActiveStep(4);
    setProgress(100);
    const totalTimeMs = Date.now() - startTime;
    setElapsed(totalTimeMs / 1000);

    // Extract team names from scorecard text
    const extractTeams = (text) => {
      // Try "Team A vs Team B" pattern
      const vsMatch = text.match(/^(.+?)\s+(?:vs\.?|versus)\s+(.+?)(?:\s*[-–—]|\n)/im);
      if (vsMatch) return { teamName: vsMatch[1].trim(), opponent: vsMatch[2].trim() };
      
      // Try "Team Innings" headers
      const inningsMatches = text.match(/^(.+?)\s+(?:innings|batting)/gim);
      if (inningsMatches && inningsMatches.length >= 2) {
        const t1 = inningsMatches[0].replace(/\s*(innings|batting).*/i, '').trim();
        const t2 = inningsMatches[1].replace(/\s*(innings|batting).*/i, '').trim();
        return { teamName: t1, opponent: t2 };
      }
      
      return { teamName: 'Team A', opponent: 'Team B' };
    };

    const teams = extractTeams(scorecardText);

    // Minor delay to let the user see 100% complete
    setTimeout(async () => {
      // Detect match result from AI analysis text
      const detectResult = (data) => {
        // Check team_summary for explicit result
        if (data?.team_summary?.result) return data.team_summary.result;
        // Parse the what_won_lost_match text for win/loss signals
        const summaryText = JSON.stringify(data?.team_summary || '').toLowerCase();
        const briefText = JSON.stringify(data?.coach_decisions || '').toLowerCase();
        const combined = summaryText + ' ' + briefText;
        if (combined.includes('won the match') || combined.includes('won by') || combined.includes('successful chase') || combined.includes('defended')) return 'Won';
        if (combined.includes('lost the match') || combined.includes('lost by') || combined.includes('failed to chase') || combined.includes('fell short')) return 'Lost';
        return null;
      };

      const newMatchRecord = { 
        format, 
        phase, 
        rawScorecard: scorecardText, 
        analysis: analysisData,
        teamName: teams.teamName,
        opponent: teams.opponent,
        result: detectResult(analysisData),
        processingTime: totalTimeMs
      };
      const savedMatch = await storageService.saveMatch(newMatchRecord);
      
      addToast('Analysis complete', 'success');
      navigate(`/match/${savedMatch.id}`);
    }, 500);
  };

  if (isAnalyzing) {
    return <LoadingScreen elapsed={elapsed} progress={progress} activeStep={activeStep} steps={steps} />;
  }

  return <ScoreboardInput onAnalyze={runAnalysis} onBack={handleBack} />;
}
