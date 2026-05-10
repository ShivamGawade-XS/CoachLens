import React, { useState, useMemo } from 'react';
import { Target, Zap, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';

const GROUND_SIZES = [
  { label: 'Small (55–60m)', value: 'small', factor: 1.12 },
  { label: 'Medium (65–70m)', value: 'medium', factor: 1.0 },
  { label: 'Large (75m+)', value: 'large', factor: 0.90 },
];

export default function TargetScoreAdvisor() {
  const [currentScore, setCurrentScore] = useState('');
  const [oversPlayed, setOversPlayed] = useState('10');
  const [wicketsDown, setWicketsDown] = useState('2');
  const [groundSize, setGroundSize] = useState('medium');
  const [totalOvers, setTotalOvers] = useState('20');
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const score = parseInt(currentScore);
    const overs = parseFloat(oversPlayed);
    const wickets = parseInt(wicketsDown);
    const total = parseInt(totalOvers);
    const ground = GROUND_SIZES.find(g => g.value === groundSize);

    if (!score || !overs || isNaN(wickets) || !total || overs <= 0 || total <= 0) return null;

    const currentRR = score / overs;
    const remainingOvers = total - overs;
    if (remainingOvers <= 0) return null;

    const wicketsInHand = 10 - wickets;

    // Base projection: current RR * remaining overs, adjusted for phase acceleration
    const phaseMultiplier = overs <= 6 ? 1.05 : overs <= 15 ? 1.15 : 1.25;
    const baseProjection = score + (currentRR * phaseMultiplier * remainingOvers);

    // Wicket adjustment: more wickets in hand = more aggressive potential
    const wicketBonus = wicketsInHand >= 8 ? 1.08 : wicketsInHand >= 6 ? 1.04 : wicketsInHand >= 4 ? 1.0 : 0.92;

    // Ground adjustment
    const groundFactor = ground?.factor || 1.0;

    const parLow = Math.round(baseProjection * wicketBonus * groundFactor * 0.95);
    const parHigh = Math.round(baseProjection * wicketBonus * groundFactor * 1.02);
    const aggressiveTarget = Math.round(parHigh * 1.08);
    const requiredRR = ((parHigh - score) / remainingOvers).toFixed(1);
    const aggressiveRR = ((aggressiveTarget - score) / remainingOvers).toFixed(1);

    // Risk assessment
    let riskLevel, riskColor, riskMessage;
    if (wicketsInHand >= 7) {
      riskLevel = 'Low Risk';
      riskColor = 'aggressor';
      riskMessage = `${wicketsInHand} wickets in hand — push for ${aggressiveTarget}+. Batting depth allows aggressive acceleration.`;
    } else if (wicketsInHand >= 4) {
      riskLevel = 'Balanced';
      riskColor = 'improving';
      riskMessage = `${wicketsInHand} wickets in hand — target par score of ${parLow}–${parHigh}. Push for ${aggressiveTarget} only if set batsmen are still at the crease.`;
    } else {
      riskLevel = 'High Risk';
      riskColor = 'liability';
      riskMessage = `Only ${wicketsInHand} wickets in hand — protect wickets and target ${parLow}. Avoid risky shots until over ${total - 3}.`;
    }

    return {
      parLow, parHigh, aggressiveTarget, requiredRR, aggressiveRR,
      currentRR: currentRR.toFixed(1), remainingOvers, wicketsInHand,
      riskLevel, riskColor, riskMessage, groundLabel: ground?.label
    };
  }, [currentScore, oversPlayed, wicketsDown, groundSize, totalOvers]);

  const handleCalculate = () => {
    if (currentScore && oversPlayed && totalOvers) {
      setShowResult(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <Target size={20} />
        </div>
        <div>
          <h2 className="text-lg font-display text-textPrimary">Target Score Advisor</h2>
          <p className="text-xs text-textTertiary font-mono">LIVE MATCH • PAR SCORE CALCULATOR</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Current Score</label>
            <input
              type="number"
              value={currentScore}
              onChange={e => { setCurrentScore(e.target.value); setShowResult(false); }}
              placeholder="e.g. 78"
              className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-lg font-display focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-textTertiary"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Overs Played</label>
            <input
              type="number"
              value={oversPlayed}
              onChange={e => { setOversPlayed(e.target.value); setShowResult(false); }}
              placeholder="e.g. 10"
              step="0.1"
              className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-lg font-display focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-textTertiary"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Wickets Down</label>
            <select
              value={wicketsDown}
              onChange={e => { setWicketsDown(e.target.value); setShowResult(false); }}
              className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
            >
              {[...Array(10)].map((_, i) => <option key={i} value={i}>{i} wickets</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Total Overs</label>
            <select
              value={totalOvers}
              onChange={e => { setTotalOvers(e.target.value); setShowResult(false); }}
              className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
            >
              <option value="20">T20 (20 overs)</option>
              <option value="50">ODI (50 overs)</option>
              <option value="10">T10 (10 overs)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Ground Size</label>
            <select
              value={groundSize}
              onChange={e => { setGroundSize(e.target.value); setShowResult(false); }}
              className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
            >
              {GROUND_SIZES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!currentScore || !oversPlayed}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap size={16} /> Calculate Target
        </button>
      </div>

      {/* Results */}
      {showResult && result && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0ms', opacity: 0 }}>
          {/* Par Score Card */}
          <div className="glass-card rounded-2xl overflow-hidden border-l-4 border-l-accent">
            <div className="p-6">
              <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-3">Par Score Range</div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-display text-accent">{result.parLow}–{result.parHigh}</span>
                <span className="text-sm font-mono text-textSecondary">runs</span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs font-mono text-textSecondary">
                <span>CRR: <span className="text-textPrimary font-bold">{result.currentRR}</span></span>
                <span>RRR: <span className="text-textPrimary font-bold">{result.requiredRR}</span></span>
                <span>Remaining: <span className="text-textPrimary font-bold">{result.remainingOvers} overs</span></span>
              </div>
            </div>
          </div>

          {/* Aggressive Target */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-improving-text mb-1 flex items-center gap-1.5">
                  <TrendingUp size={12} /> Aggressive Target
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display text-textPrimary">{result.aggressiveTarget}+</span>
                  <span className="text-xs font-mono text-textSecondary">@ RR {result.aggressiveRR}</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border bg-${result.riskColor}-bg text-${result.riskColor}-text border-${result.riskColor}-border`}>
                {result.riskLevel}
              </div>
            </div>
          </div>

          {/* AI Coaching Note */}
          <div className={`glass-card rounded-2xl p-5 border-l-4 border-l-${result.riskColor}-text`}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {result.riskColor === 'liability' ? <AlertTriangle size={16} className="text-liability-text" /> : <ChevronRight size={16} className="text-accent" />}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-1.5">Coach Advisory</div>
                <p className="text-sm text-textPrimary leading-relaxed">{result.riskMessage}</p>
                <p className="text-xs text-textSecondary font-mono mt-2">Ground: {result.groundLabel} • Wickets in hand: {result.wicketsInHand}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
