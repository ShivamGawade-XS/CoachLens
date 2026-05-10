import React, { useState, useEffect } from 'react';
import { Loader2, Coins, ShieldAlert, Zap } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { groqService } from '../../services/groqService';

export default function TossAdvisor({ match }) {
  const [loading, setLoading] = useState(true);
  const [decisionData, setDecisionData] = useState(null);
  const [insufficientData, setInsufficientData] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!match || !match.teamName) {
      setLoading(false);
      setInsufficientData(true);
      return;
    }

    const fetchTossDecision = async () => {
      // Check if we already cached the toss decision for this match
      if (match.tossDecision) {
        setDecisionData(match.tossDecision);
        setLoading(false);
        return;
      }

      try {
        // Fetch historical matches
        const allMatches = await storageService.getMatches();
        
        // Filter matches where this team played, excluding the current match
        const teamMatches = allMatches.filter(m => 
          (m.teamName === match.teamName || m.opponent === match.teamName) && 
          m.id !== match.id
        );

        // Require at least 2 historical matches for a decent recommendation
        if (teamMatches.length < 2) {
          setInsufficientData(true);
          setLoading(false);
          return;
        }

        // Format history for the prompt
        const historyData = teamMatches.map(m => ({
          date: m.date,
          team: match.teamName,
          opponent: m.teamName === match.teamName ? m.opponent : m.teamName,
          teamSummary: m.analysis?.team_summary || {},
          result: m.result || "Unknown",
        }));

        // Call Groq AI
        const decision = await groqService.getTossDecision(historyData);
        
        // Ensure standard structure
        const validatedDecision = {
          decision: decision.decision?.toUpperCase() === 'BAT' ? 'BAT' : 'FIELD',
          confidence: decision.confidence || 'Medium',
          reason: decision.reason || 'Based on recent performance patterns.'
        };

        setDecisionData(validatedDecision);
        
        // Cache it back to the match object to save API calls
        await storageService.updateMatch(match.id, { tossDecision: validatedDecision });

      } catch (err) {
        console.error("Failed to generate Toss Decision", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTossDecision();
  }, [match]);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 mb-8 flex items-center justify-center gap-3 border border-border">
        <Loader2 className="animate-spin text-accent" size={20} />
        <span className="text-sm font-mono text-textSecondary uppercase tracking-wider">AI Analyzing Team History...</span>
      </div>
    );
  }

  if (insufficientData) {
    return (
      <div className="glass-card rounded-xl p-6 mb-8 border border-border bg-surface2/50 flex gap-4 items-start">
        <div className="shrink-0 p-3 bg-surface3 rounded-lg text-textTertiary">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="text-sm font-mono font-bold text-textPrimary uppercase tracking-wider mb-1">AI Toss Advisor Locked</h3>
          <p className="text-sm text-textSecondary leading-relaxed">
            Not enough historical data for <strong className="text-textPrimary">{match.teamName || 'this team'}</strong>. Add at least 2 more matches for this team to unlock AI-driven toss recommendations based on performance trends.
          </p>
        </div>
      </div>
    );
  }

  if (error || !decisionData) return null;

  const isBat = decisionData.decision === 'BAT';

  return (
    <div className="relative mb-8 p-[1px] rounded-xl bg-gradient-to-r from-accent via-accent/30 to-border overflow-hidden">
      <div className="glass-card rounded-[11px] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-primary/95">
        
        {/* Big Decision Badge */}
        <div className="shrink-0 flex flex-col items-center">
          <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card transition-all ${
            isBat 
              ? 'bg-accent/15 text-accent border border-accent/30' 
              : 'bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30'
          }`}>
            <Coins size={32} />
            <span className="font-display text-2xl font-bold tracking-wider">{decisionData.decision}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <h3 className="text-sm font-mono font-bold text-textPrimary uppercase tracking-[0.1em]">AI Toss Recommendation</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
              decisionData.confidence.toLowerCase() === 'high' 
                ? 'bg-aggressor-bg text-aggressor-text border border-aggressor-border' 
                : 'bg-surface2 text-textSecondary border border-border'
            }`}>
              {decisionData.confidence} Confidence
            </span>
          </div>
          
          <p className="text-base text-textSecondary leading-relaxed mb-4">
            {decisionData.reason}
          </p>

          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-textTertiary uppercase tracking-wider bg-surface2 px-3 py-1.5 rounded-lg border border-border">
            <Zap size={12} className="text-accent" />
            Analyzed from cross-match data
          </div>
        </div>
      </div>
    </div>
  );
}
