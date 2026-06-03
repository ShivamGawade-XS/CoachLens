import React, { useState } from 'react';
import { Calendar, Plus, X, Loader2, Users, ChevronRight } from 'lucide-react';
import { groqService } from '../../services/groqService';
import { getTeams } from '../../pages/AppPages';
import { useAuth } from '../../contexts/AuthContext';

export default function SquadRotationPlanner() {
  const { user } = useAuth();
  const teams = user ? getTeams(user.id) : [];

  const [squad, setSquad] = useState([{ name: '', role: 'Batsman', fitness: 'Fit' }]);
  const [matches, setMatches] = useState([{ opponent: '', date: '', type: 'League' }]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoadTeam = (teamId) => {
    if (!teamId) return;
    const team = teams.find(t => t.id === teamId);
    if (team) {
      if (team.roster && team.roster.length > 0) {
        setSquad(team.roster.map(p => {
          let fit = 'Fit';
          if (p.healthStatus === 'niggle') fit = 'Slight Niggle';
          else if (p.healthStatus === 'recovering') fit = 'Recovering';
          else if (p.healthStatus === 'injured') fit = 'Doubtful';
          return {
            name: p.name,
            role: p.role || 'Batsman',
            fitness: fit
          };
        }));
      } else {
        setSquad([{ name: '', role: 'Batsman', fitness: 'Fit' }]);
      }

      if (team.schedule && team.schedule.length > 0) {
        setMatches(team.schedule.map(s => ({
          opponent: s.opponent,
          date: s.date || '',
          type: s.format === 'ODI' ? 'Friendly' : 'League'
        })));
      } else {
        setMatches([{ opponent: '', date: '', type: 'League' }]);
      }
    }
  };

  const ROLES = ['Batsman', 'Bowler', 'Allrounder', 'Wicketkeeper'];
  const FITNESS = ['Fit', 'Slight Niggle', 'Recovering', 'Doubtful'];
  const MATCH_TYPES = ['League', 'Quarter-Final', 'Semi-Final', 'Final', 'Friendly'];

  const addPlayer = () => setSquad([...squad, { name: '', role: 'Batsman', fitness: 'Fit' }]);
  const removePlayer = (i) => setSquad(squad.filter((_, idx) => idx !== i));
  const updatePlayer = (i, field, value) => { const ns = [...squad]; ns[i][field] = value; setSquad(ns); };

  const addMatch = () => setMatches([...matches, { opponent: '', date: '', type: 'League' }]);
  const removeMatch = (i) => setMatches(matches.filter((_, idx) => idx !== i));
  const updateMatch = (i, field, value) => { const nm = [...matches]; nm[i][field] = value; setMatches(nm); };

  const validSquad = squad.filter(p => p.name.trim());
  const validMatches = matches.filter(m => m.opponent.trim());

  const handlePlan = async () => {
    if (validSquad.length < 11 || validMatches.length < 2) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      let apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey && typeof window !== 'undefined') apiKey = localStorage.getItem('GROQ_API_KEY');
      if (!apiKey) throw new Error("No Groq API key configured.");

      const prompt = `You are an expert cricket tournament strategist planning squad rotation across a multi-match tournament.

Squad (${validSquad.length} players):
${validSquad.map((p, i) => `${i+1}. ${p.name} — ${p.role} — Fitness: ${p.fitness}`).join('\n')}

Tournament Schedule (${validMatches.length} matches):
${validMatches.map((m, i) => `Match ${i+1}: vs ${m.opponent} (${m.type})${m.date ? ' on ' + m.date : ''}`).join('\n')}

Rules:
- Select a playing XI for EACH match.
- Rotate pace bowlers — max 3 consecutive matches for fast bowlers.
- Rest key players before knockout matches.
- Consider fitness status when selecting.
- For each match, explain 1-2 key rotation decisions.

Return ONLY a JSON object:
{
  "rotation_plan": [
    {
      "match": "vs Opponent (Type)",
      "playing_xi": ["player names"],
      "rested": ["player names"],
      "key_decisions": ["1-sentence rotation reasoning"]
    }
  ],
  "workload_summary": [
    { "name": "player name", "matches_playing": <number>, "matches_rested": <number>, "note": "brief note" }
  ],
  "strategy_note": "1-2 sentence overall tournament strategy"
}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3, max_tokens: 1500,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(`API error: ${errData?.error?.message || response.statusText}`);
      }
      const data = await response.json();
      setResult(JSON.parse(data.choices[0].message.content));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <Calendar size={20} />
        </div>
        <div>
          <h2 className="text-lg font-display text-textPrimary">Squad Rotation Planner</h2>
          <p className="text-xs text-textTertiary font-mono">TOURNAMENT • WORKLOAD MANAGEMENT</p>
        </div>
      </div>

      {!result ? (
        <div className="space-y-5">
          {/* Load from Team */}
          {teams.length > 0 && (
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary block">Auto-Populate from Team</label>
              <select
                onChange={(e) => handleLoadTeam(e.target.value)}
                defaultValue=""
                className="w-full bg-surface2 border border-border text-textPrimary rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Select a Team --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Squad Input */}
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary block">Squad ({validSquad.length} players)</label>
            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
              {squad.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-textTertiary w-5 shrink-0">{i+1}.</span>
                  <input type="text" value={p.name} onChange={e => updatePlayer(i, 'name', e.target.value)} placeholder="Name" className="flex-1 bg-surface2 border border-border text-textPrimary rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent transition-all placeholder:text-textTertiary" />
                  <select value={p.role} onChange={e => updatePlayer(i, 'role', e.target.value)} className="bg-surface2 border border-border text-textPrimary rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer w-28">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={p.fitness} onChange={e => updatePlayer(i, 'fitness', e.target.value)} className="bg-surface2 border border-border text-textPrimary rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer w-28">
                    {FITNESS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {squad.length > 1 && <button onClick={() => removePlayer(i)} className="text-textTertiary hover:text-liability-text transition-colors shrink-0"><X size={14} /></button>}
                </div>
              ))}
            </div>
            <button onClick={addPlayer} className="text-xs text-accent font-mono hover:underline flex items-center gap-1"><Plus size={12} /> Add player</button>
          </div>

          {/* Match Schedule */}
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <label className="text-[10px] uppercase tracking-wider font-mono text-textSecondary block">Match Schedule ({validMatches.length} matches)</label>
            <div className="space-y-2">
              {matches.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-textTertiary w-5 shrink-0">M{i+1}</span>
                  <input type="text" value={m.opponent} onChange={e => updateMatch(i, 'opponent', e.target.value)} placeholder="Opponent" className="flex-1 bg-surface2 border border-border text-textPrimary rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent transition-all placeholder:text-textTertiary" />
                  <input type="date" value={m.date} onChange={e => updateMatch(i, 'date', e.target.value)} className="bg-surface2 border border-border text-textPrimary rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent transition-all w-36" />
                  <select value={m.type} onChange={e => updateMatch(i, 'type', e.target.value)} className="bg-surface2 border border-border text-textPrimary rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer w-28">
                    {MATCH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {matches.length > 1 && <button onClick={() => removeMatch(i)} className="text-textTertiary hover:text-liability-text transition-colors shrink-0"><X size={14} /></button>}
                </div>
              ))}
            </div>
            <button onClick={addMatch} className="text-xs text-accent font-mono hover:underline flex items-center gap-1"><Plus size={12} /> Add match</button>
          </div>

          {error && <p className="text-xs font-mono text-liability-text">{error}</p>}

          <button onClick={handlePlan} disabled={validSquad.length < 11 || validMatches.length < 2 || isLoading} className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber disabled:opacity-40">
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Planning...</> : <><Calendar size={16} /> Generate Rotation Plan</>}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Strategy Note */}
          {result.strategy_note && (
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-accent">
              <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-1">Tournament Strategy</div>
              <p className="text-sm text-textPrimary">{result.strategy_note}</p>
            </div>
          )}

          {/* Match-by-match plan */}
          {(result.rotation_plan || []).map((match, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-surface2/30 flex items-center justify-between">
                <span className="font-display text-textPrimary">Match {i + 1}: {match.match}</span>
                <span className="text-[10px] font-mono text-accent uppercase tracking-wider">{(match.playing_xi || []).length} selected</span>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {(match.playing_xi || []).map((name, j) => (
                    <span key={j} className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-aggressor-bg/30 text-aggressor-text border border-aggressor-border/30">{name}</span>
                  ))}
                </div>
                {(match.rested || []).length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-textTertiary uppercase tracking-wider">Rested: </span>
                    {match.rested.map((name, j) => (
                      <span key={j} className="text-[11px] font-mono text-liability-text mr-2">{name}</span>
                    ))}
                  </div>
                )}
                {(match.key_decisions || []).map((d, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <ChevronRight size={12} className="text-accent mt-0.5 shrink-0" />
                    <p className="text-xs text-textSecondary">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Workload Summary */}
          {(result.workload_summary || []).length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <span className="text-sm font-mono uppercase tracking-wider text-textPrimary font-bold flex items-center gap-2">
                  <Users size={14} className="text-accent" /> Workload Summary
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {result.workload_summary.map((p, i) => (
                  <div key={i} className="px-6 py-3 flex items-center gap-4">
                    <span className="font-mono text-textPrimary flex-1">{p.name}</span>
                    <span className="text-xs font-mono text-aggressor-text">{p.matches_playing} playing</span>
                    <span className="text-xs font-mono text-textTertiary">{p.matches_rested} rested</span>
                    {p.note && <span className="text-[10px] font-mono text-textSecondary max-w-[150px] truncate">{p.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setResult(null)} className="w-full flex items-center justify-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary font-mono font-bold py-3 text-sm uppercase tracking-wider transition-all btn-press rounded-xl">
            Modify Plan
          </button>
        </div>
      )}
    </div>
  );
}
