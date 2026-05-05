import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreboardInput from '../components/ScoreboardInput/ScoreboardInput';
import { groqService } from '../services/groqService';
import { storageService } from '../services/storageService';

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
            <div key={i} className={`flex items-center gap-3 text-sm font-mono transition-all duration-500 ${i < activeStep ? 'text-textPrimary' : 'text-textTertiary'}`} style={{ opacity: i < activeStep ? 1 : 0.3, transform: i < activeStep ? 'translateX(0)' : 'translateX(8px)' }}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${i < activeStep ? 'bg-accent/20 border border-accent/40' : 'border border-border'}`}>
                {i < activeStep && <div className="w-2 h-2 rounded-full bg-accent animate-scale-pop" />}
              </div>
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-surface2 rounded-full h-2 overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-accent to-accentHover rounded-full transition-all duration-200 ease-linear" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-textTertiary font-mono">{elapsed}s elapsed</span>
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
    'Running player pattern analysis',
    'Identifying team scoring trends',
    'Building coach decision brief',
  ];

  const handleBack = () => navigate('/dashboard');

  const runAnalysis = async (format, phase, scorecardText) => {
    setIsAnalyzing(true);
    
    const startTime = Date.now();
    const duration = 3000;
    
    const progressInterval = setInterval(() => {
      const el = Date.now() - startTime;
      setProgress(Math.min((el / duration) * 100, 98));
      setElapsed(Math.floor(el / 1000));
    }, 50);

    const stepTimers = steps.map((_, i) => setTimeout(() => setActiveStep(i + 1), (i + 1) * 800));

    try {
      const analysisData = await groqService.analyze(format, phase, scorecardText);
      const newMatchRecord = { format, phase, rawScorecard: scorecardText, analysis: analysisData };
      const savedMatch = storageService.saveMatch(newMatchRecord);
      
      clearInterval(progressInterval);
      stepTimers.forEach(clearTimeout);
      
      addToast('Analysis complete — coaching brief ready', 'success');
      navigate(`/match/${savedMatch.id}`);
    } catch (error) {
      clearInterval(progressInterval);
      stepTimers.forEach(clearTimeout);
      console.error("Analysis failed:", error);
      addToast('Analysis failed. Using cached demo data.', 'warning');
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <LoadingScreen elapsed={elapsed} progress={progress} activeStep={activeStep} steps={steps} />;
  }

  return <ScoreboardInput onAnalyze={runAnalysis} onBack={handleBack} />;
}
