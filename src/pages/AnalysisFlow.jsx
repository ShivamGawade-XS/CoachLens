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
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${i <= activeStep ? 'bg-accent/20 border border-accent/40' : 'border border-border'}`}>
                {i <= activeStep && <div className="w-2 h-2 rounded-full bg-accent animate-scale-pop" />}
              </div>
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-surface2 rounded-full h-2 overflow-hidden mb-1">
          <div className="h-full bg-gradient-to-r from-aggressor-text to-aggressor-text rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="w-full flex justify-between mt-2">
          <span className="text-[10px] text-textTertiary font-mono uppercase tracking-wider">{steps[activeStep]}</span>
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
    'Analyzing players...',
    'Building team report...',
    'Preparing coach brief...',
  ];

  const handleBack = () => navigate('/dashboard');

  const runAnalysis = async (format, phase, scorecardText) => {
    setIsAnalyzing(true);
    const startTime = Date.now();
    let isFallback = false;
    let analysisData;
    
    // Timer to update elapsed seconds UI smoothly
    const timerInterval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);

    const handleProgress = (stage) => {
      if (stage === 'stage1') { setActiveStep(0); setProgress(25); }
      if (stage === 'stage2') { setActiveStep(1); setProgress(60); }
      if (stage === 'stage3') { setActiveStep(2); setProgress(85); }
      if (stage === 'stage4') { setActiveStep(3); setProgress(100); }
    };

    try {
      analysisData = await groqService.analyze(format, phase, scorecardText, handleProgress);
    } catch (error) {
      console.warn("Analysis failed, using fallback:", error);
      isFallback = true;
      analysisData = FALLBACK_ANALYSES.demo_live;
      // Force UI to complete
      setActiveStep(3);
      setProgress(100);
    }

    clearInterval(timerInterval);
    const totalTimeMs = Date.now() - startTime;
    setElapsed(totalTimeMs / 1000);

    // Minor delay to let the user see 100% complete
    setTimeout(async () => {
      const newMatchRecord = { 
        format, 
        phase, 
        rawScorecard: scorecardText, 
        analysis: analysisData,
        isFallback,
        processingTime: totalTimeMs
      };
      const savedMatch = await storageService.saveMatch(newMatchRecord);
      
      if (isFallback) {
        addToast('Using cached analysis — API unavailable', 'warning');
      } else {
        addToast('Analysis complete', 'success');
      }
      navigate(`/match/${savedMatch.id}`);
    }, 500);
  };

  if (isAnalyzing) {
    return <LoadingScreen elapsed={elapsed} progress={progress} activeStep={activeStep} steps={steps} />;
  }

  return <ScoreboardInput onAnalyze={runAnalysis} onBack={handleBack} />;
}
