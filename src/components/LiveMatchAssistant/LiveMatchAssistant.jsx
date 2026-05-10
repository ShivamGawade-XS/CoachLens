import React, { useState, useRef, useEffect } from 'react';
import { Radio, Zap, Plus, RotateCcw, Loader2, AlertTriangle, ChevronRight } from 'lucide-react';
import { groqService } from '../../services/groqService';

export default function LiveMatchAssistant() {
  const [matchInfo, setMatchInfo] = useState({ teamName: '', opponent: '', format: 'T20', batting: 'us' });
  const [started, setStarted] = useState(false);
  const [overs, setOvers] = useState([]);
  const [currentOver, setCurrentOver] = useState({ balls: [], wickets: 0 });
  const [bowlers, setBowlers] = useState([{ name: '', overs: 0 }]);
  const [currentBowler, setCurrentBowler] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [overs, aiRecommendations]);

  const totalRuns = overs.reduce((sum, o) => sum + o.runs, 0) + currentOver.balls.reduce((sum, b) => sum + (b.type === 'W' ? 0 : b.runs), 0);
  const totalWickets = overs.reduce((sum, o) => sum + o.wickets, 0) + currentOver.wickets;
  const totalOversCompleted = overs.length;
  const currentRR = totalOversCompleted > 0 ? (totalRuns / (totalOversCompleted + currentOver.balls.length / 6)).toFixed(1) : '0.0';

  const addBall = (runs, isWicket = false) => {
    if (currentOver.balls.length >= 6) return;
    const newBalls = [...currentOver.balls, { runs, type: isWicket ? 'W' : 'run' }];
    const newWickets = currentOver.wickets + (isWicket ? 1 : 0);
    setCurrentOver({ balls: newBalls, wickets: newWickets });
  };

  const completeOver = async () => {
    const overRuns = currentOver.balls.reduce((sum, b) => sum + (b.type === 'W' ? 0 : b.runs), 0);
    const completedOver = {
      number: overs.length + 1,
      runs: overRuns,
      wickets: currentOver.wickets,
      balls: currentOver.balls,
      bowler: currentBowler
    };

    const newOvers = [...overs, completedOver];
    setOvers(newOvers);
    setCurrentOver({ balls: [], wickets: 0 });

    // Update bowler overs
    if (currentBowler) {
      setBowlers(prev => prev.map(b => b.name === currentBowler ? { ...b, overs: b.overs + 1 } : b));
    }

    // Get AI recommendation
    setIsLoading(true);
    setError('');
    try {
      const matchState = {
        team: matchInfo.teamName,
        opponent: matchInfo.opponent,
        format: matchInfo.format,
        batting: matchInfo.batting === 'us' ? matchInfo.teamName : matchInfo.opponent,
        score: `${totalRuns + overRuns}/${totalWickets + currentOver.wickets}`,
        overs_completed: newOvers.length,
        current_run_rate: ((totalRuns + overRuns) / newOvers.length).toFixed(1),
        last_3_overs: newOvers.slice(-3).map(o => `Over ${o.number}: ${o.runs} runs, ${o.wickets} wkts (${o.bowler || 'unknown'})`),
        bowlers_used: bowlers.filter(b => b.name).map(b => `${b.name}: ${b.overs} overs bowled`),
        wickets_in_hand: 10 - (totalWickets + currentOver.wickets)
      };
      const rec = await groqService.getOverRecommendation(matchState);
      setAiRecommendations(prev => [...prev, { over: newOvers.length, ...rec }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const undoLastBall = () => {
    if (currentOver.balls.length === 0) return;
    const removed = currentOver.balls[currentOver.balls.length - 1];
    setCurrentOver({
      balls: currentOver.balls.slice(0, -1),
      wickets: currentOver.wickets - (removed.type === 'W' ? 1 : 0)
    });
  };

  const getPressureColor = (rating) => {
    if (rating === 'Low') return 'aggressor';
    if (rating === 'Medium') return 'anchor';
    if (rating === 'High') return 'improving';
    return 'liability';
  };

  if (!started) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-liability-bg border border-liability-border flex items-center justify-center text-liability-text">
            <Radio size={20} />
          </div>
          <div>
            <h2 className="text-lg font-display text-textPrimary">Live Match Assistant</h2>
            <p className="text-xs text-textTertiary font-mono">BALL-BY-BALL • DUGOUT MODE</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Your Team</label>
              <input type="text" value={matchInfo.teamName} onChange={e => setMatchInfo({...matchInfo, teamName: e.target.value})} placeholder="e.g. Panaji Panthers" className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-textTertiary" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Opponent</label>
              <input type="text" value={matchInfo.opponent} onChange={e => setMatchInfo({...matchInfo, opponent: e.target.value})} placeholder="e.g. Vasco Warriors" className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-textTertiary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Format</label>
              <select value={matchInfo.format} onChange={e => setMatchInfo({...matchInfo, format: e.target.value})} className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer">
                <option value="T20">T20</option><option value="ODI">ODI</option><option value="T10">T10</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Currently Batting</label>
              <select value={matchInfo.batting} onChange={e => setMatchInfo({...matchInfo, batting: e.target.value})} className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer">
                <option value="us">We are batting</option><option value="them">They are batting</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Bowlers (add names)</label>
            <div className="space-y-2">
              {bowlers.map((b, i) => (
                <input key={i} type="text" value={b.name} onChange={e => { const nb = [...bowlers]; nb[i].name = e.target.value; setBowlers(nb); }} placeholder={`Bowler ${i + 1}`} className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-accent transition-all placeholder:text-textTertiary" />
              ))}
              <button onClick={() => setBowlers([...bowlers, { name: '', overs: 0 }])} className="text-xs text-accent font-mono hover:underline flex items-center gap-1"><Plus size={12} /> Add bowler</button>
            </div>
          </div>

          <button onClick={() => setStarted(true)} disabled={!matchInfo.teamName || !matchInfo.opponent} className="w-full flex items-center justify-center gap-2 bg-liability-bg hover:bg-liability-bg/80 text-liability-text border border-liability-border font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl disabled:opacity-40">
            <Radio size={16} /> Start Live Match
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Header */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div>
            <span className="font-display text-textPrimary text-lg">{matchInfo.teamName} vs {matchInfo.opponent}</span>
            <span className="text-xs font-mono text-textTertiary ml-3">{matchInfo.format}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display text-accent">{totalRuns}/{totalWickets}</div>
          <div className="text-[10px] font-mono text-textTertiary">{totalOversCompleted}.{currentOver.balls.length} overs • RR {currentRR}</div>
        </div>
      </div>

      {/* Current Over + Ball Input */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-textSecondary">Over {totalOversCompleted + 1}</span>
            {currentBowler && <span className="text-xs font-mono text-textTertiary ml-2">— {currentBowler}</span>}
          </div>
          <select value={currentBowler} onChange={e => setCurrentBowler(e.target.value)} className="bg-surface2 border border-border text-textPrimary rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer">
            <option value="">Select bowler</option>
            {bowlers.filter(b => b.name).map(b => <option key={b.name} value={b.name}>{b.name} ({b.overs} ov)</option>)}
          </select>
        </div>

        {/* Ball display */}
        <div className="flex gap-2">
          {currentOver.balls.map((ball, i) => (
            <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono border ${
              ball.type === 'W' ? 'bg-liability-bg text-liability-text border-liability-border' :
              ball.runs >= 4 ? 'bg-aggressor-bg text-aggressor-text border-aggressor-border' :
              ball.runs === 0 ? 'bg-surface3 text-textTertiary border-border' :
              'bg-anchor-bg text-anchor-text border-anchor-border'
            }`}>
              {ball.type === 'W' ? 'W' : ball.runs}
            </div>
          ))}
          {[...Array(6 - currentOver.balls.length)].map((_, i) => (
            <div key={`empty-${i}`} className="w-10 h-10 rounded-full border border-dashed border-border/50 flex items-center justify-center text-textTertiary text-xs">·</div>
          ))}
        </div>

        {/* Input buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 6].map(r => (
            <button key={r} onClick={() => addBall(r)} disabled={currentOver.balls.length >= 6} className="w-12 h-12 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textPrimary font-display text-lg transition-all disabled:opacity-30 btn-press">{r}</button>
          ))}
          <button onClick={() => addBall(0, true)} disabled={currentOver.balls.length >= 6} className="px-4 h-12 rounded-xl bg-liability-bg/50 hover:bg-liability-bg border border-liability-border text-liability-text font-mono text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-30 btn-press">W</button>
          <button onClick={undoLastBall} disabled={currentOver.balls.length === 0} className="px-3 h-12 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textSecondary transition-all disabled:opacity-30"><RotateCcw size={16} /></button>
        </div>

        {currentOver.balls.length === 6 && (
          <button onClick={completeOver} className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white font-mono font-bold py-3 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber">
            <Zap size={16} /> Complete Over — Get AI Advice
          </button>
        )}
      </div>

      {/* AI Recommendations Feed */}
      <div ref={feedRef} className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading && (
          <div className="glass-card rounded-2xl p-5 text-center animate-pulse">
            <Loader2 size={20} className="animate-spin mx-auto mb-2 text-accent" />
            <p className="text-xs font-mono text-textTertiary">AI analyzing match state...</p>
          </div>
        )}
        {error && (
          <div className="glass-card rounded-2xl p-4 border-l-4 border-l-liability-text">
            <p className="text-xs font-mono text-liability-text">{error}</p>
          </div>
        )}
        {[...aiRecommendations].reverse().map((rec, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border-l-4 border-l-accent animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider font-mono text-textTertiary">After Over {rec.over}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider border bg-${getPressureColor(rec.pressure_rating)}-bg text-${getPressureColor(rec.pressure_rating)}-text border-${getPressureColor(rec.pressure_rating)}-border`}>
                {rec.pressure_rating} Pressure
              </span>
            </div>
            {rec.projected_total && (
              <div className="text-xs font-mono text-textSecondary mb-3">Projected: <span className="text-accent font-bold">{rec.projected_total}</span></div>
            )}
            <div className="space-y-2">
              {(rec.recommendations || []).map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight size={14} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-textPrimary font-medium">{r.action}</p>
                    <p className="text-[11px] text-textTertiary font-mono">{r.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
