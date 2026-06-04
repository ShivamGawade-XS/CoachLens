import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreboardInput from '../components/ScoreboardInput/ScoreboardInput';
import { groqService } from '../services/groqService';
import { storageService } from '../services/storageService';
import { PlanContext } from '../App';

function LoadingScreen({ elapsed, thinkingText }) {
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [thinkingText]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10 w-full max-w-2xl mx-auto px-4">
      <div className="flex flex-col items-center w-full px-6 py-8 rounded-2xl bg-surface1/50 border border-border/40 backdrop-blur-md shadow-2xl">
        <div className="w-16 h-16 relative mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" style={{ animationDuration: '1s' }} />
        </div>
        <h2 className="text-display-sm font-display mb-2 text-textPrimary text-center">Analyzing match...</h2>
        <p className="text-xs text-textSecondary font-mono mb-6">Elapsed: {elapsed.toFixed(1)}s</p>
        
        <div className="w-full flex flex-col items-stretch">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-textTertiary font-mono uppercase tracking-wider">Live AI Stream</span>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
          <textarea
            ref={textareaRef}
            readOnly
            value={thinkingText}
            className="w-full h-64 p-4 rounded-lg bg-surface2 border border-border/40 font-mono text-xs text-textSecondary resize-none outline-none focus:border-accent/40 transition-colors"
            placeholder="Waiting for AI response stream..."
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalysisFlow({ addToast }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const navigate = useNavigate();
  const plan = useContext(PlanContext);

  const handleBack = () => navigate('/dashboard');

  const runAnalysis = async (format, phase, scorecardText) => {
    setIsAnalyzing(true);
    setThinkingText('');
    const startTime = Date.now();
    let analysisData;
    
    // Timer to update elapsed seconds UI smoothly
    const timerInterval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);

    try {
      analysisData = await groqService.analyze(scorecardText, format, phase, 'Direct', (text) => {
        setThinkingText(text);
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      clearInterval(timerInterval);
      setIsAnalyzing(false);
      addToast(`Analysis Error: ${error.message}`, 'error');
      return;
    }

    clearInterval(timerInterval);
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

      // Increment free-tier counter; show upgrade modal if limit now hit
      if (plan) {
        plan.incrementCount();
        // Check after increment: if the NEW count hits the limit, open modal
        const newCount = (plan.analysisCount ?? 0) + 1;
        if (!plan.isPaid && newCount >= plan.FREE_LIMIT) {
          plan.openUpgradeModal();
        }
      }

      navigate(`/match/${savedMatch.id}`);
    }, 500);
  };

  if (isAnalyzing) {
    return <LoadingScreen elapsed={elapsed} thinkingText={thinkingText} />;
  }

  return <ScoreboardInput onAnalyze={runAnalysis} onBack={handleBack} />;
}
