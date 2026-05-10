import React, { useState } from 'react';
import { Users, Plus, X, Loader2, Check, Ban, ChevronRight, Shield } from 'lucide-react';
import { groqService } from '../../services/groqService';

const ROLES = ['Batsman', 'Bowler', 'Allrounder', 'Wicketkeeper'];

export default function BestXISelector() {
  const [squad, setSquad] = useState([{ name: '', role: 'Batsman', stats: '' }]);
  const [opponentInfo, setOpponentInfo] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addPlayer = () => setSquad([...squad, { name: '', role: 'Batsman', stats: '' }]);
  const removePlayer = (i) => setSquad(squad.filter((_, idx) => idx !== i));
  const updatePlayer = (i, field, value) => {
    const ns = [...squad];
    ns[i][field] = value;
    setSquad(ns);
  };

  const validSquad = squad.filter(p => p.name.trim());

  const handleSelect = async () => {
    if (validSquad.length < 11) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await groqService.selectBestXI(validSquad, opponentInfo || 'No specific opponent context provided. Select the strongest balanced XI.');
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTagColor = (role) => {
    if (role?.includes('Bat') || role?.includes('bat')) return 'bg-aggressor-bg text-aggressor-text border-aggressor-border';
    if (role?.includes('Bowl') || role?.includes('bowl')) return 'bg-anchor-bg text-anchor-text border-anchor-border';
    if (role?.includes('All') || role?.includes('all')) return 'bg-improving-bg text-improving-text border-improving-border';
    if (role?.includes('Wick') || role?.includes('wick') || role?.includes('keeper')) return 'bg-accent/10 text-accent border-accent/20';
    return 'bg-surface2 text-textSecondary border-border';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-improving-bg border border-improving-border flex items-center justify-center text-improving-text">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="text-lg font-display text-textPrimary">Best XI Selector</h2>
          <p className="text-xs text-textTertiary font-mono">AI TEAM SELECTION • NUMBERS-BACKED</p>
        </div>
      </div>

      {!result ? (
        <div className="glass-card rounded-2xl p-6 space-y-5">
          {/* Squad Input */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-2 block">Squad ({validSquad.length} players)</label>
            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {squad.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-textTertiary w-5 shrink-0">{i + 1}.</span>
                  <input type="text" value={p.name} onChange={e => updatePlayer(i, 'name', e.target.value)} placeholder="Player name" className="flex-1 bg-surface2 border border-border text-textPrimary rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent transition-all placeholder:text-textTertiary" />
                  <select value={p.role} onChange={e => updatePlayer(i, 'role', e.target.value)} className="bg-surface2 border border-border text-textPrimary rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer w-28">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input type="text" value={p.stats} onChange={e => updatePlayer(i, 'stats', e.target.value)} placeholder="Key stats (optional)" className="w-36 bg-surface2 border border-border text-textPrimary rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent transition-all placeholder:text-textTertiary" />
                  {squad.length > 1 && (
                    <button onClick={() => removePlayer(i)} className="text-textTertiary hover:text-liability-text transition-colors shrink-0"><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addPlayer} className="text-xs text-accent font-mono hover:underline flex items-center gap-1 mt-2"><Plus size={12} /> Add player</button>
          </div>

          {/* Opponent Context */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary mb-1.5 block">Opponent / Match Context (optional)</label>
            <textarea value={opponentInfo} onChange={e => setOpponentInfo(e.target.value)} placeholder="e.g. 'Playing against Vasco Warriors. Their top 3 are all right-handers. Small ground. Evening match — dew expected.'" rows={3} className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-textTertiary resize-none" />
          </div>

          {error && <p className="text-xs font-mono text-liability-text">{error}</p>}

          <button onClick={handleSelect} disabled={validSquad.length < 11 || isLoading} className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber disabled:opacity-40">
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> AI Selecting...</> : <><Users size={16} /> Select Best XI</>}
          </button>
          {validSquad.length < 11 && <p className="text-[10px] text-textTertiary font-mono text-center">Need at least 11 players. Currently {validSquad.length}.</p>}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Team Balance */}
          {result.team_balance && (
            <div className="glass-card rounded-2xl p-4 border-l-4 border-l-accent">
              <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-1">Team Balance</div>
              <p className="text-sm text-textPrimary">{result.team_balance}</p>
            </div>
          )}

          {/* Playing XI */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Check size={16} className="text-aggressor-text" />
              <span className="text-sm font-mono uppercase tracking-wider text-textPrimary font-bold">Playing XI</span>
            </div>
            <div className="divide-y divide-border/50">
              {(result.playing_xi || []).map((p, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <span className="text-lg font-display text-accent/50 w-8">{p.batting_position || i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-textPrimary">{p.name}</span>
                      <span className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${getTagColor(p.role)}`}>{p.role}</span>
                    </div>
                    <p className="text-xs font-mono text-textTertiary mt-1">{p.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dropped */}
          {(result.dropped || []).length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Ban size={16} className="text-liability-text" />
                <span className="text-sm font-mono uppercase tracking-wider text-textPrimary font-bold">Not Selected</span>
              </div>
              <div className="divide-y divide-border/50">
                {result.dropped.map((p, i) => (
                  <div key={i} className="px-6 py-3 flex items-center gap-4">
                    <Ban size={14} className="text-liability-text/50 shrink-0" />
                    <div>
                      <span className="font-display text-textSecondary">{p.name}</span>
                      <p className="text-xs font-mono text-textTertiary mt-0.5">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setResult(null)} className="w-full flex items-center justify-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary font-mono font-bold py-3 text-sm uppercase tracking-wider transition-all btn-press rounded-xl">
            <RotateCcw size={16} /> Modify Squad
          </button>
        </div>
      )}
    </div>
  );
}

function RotateCcw(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
  );
}
