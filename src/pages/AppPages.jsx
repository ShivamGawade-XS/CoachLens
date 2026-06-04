/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, ArrowRight, Plus, X, Trash2, AlertCircle, User, Key, Palette, TrendingUp, TrendingDown, Edit2, Search, Filter, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTeamFormGuide } from '../utils/seasonScoring';
import PlanContext from '../contexts/PlanContext';
import { storageService } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabaseClient';

const TEAMS_KEY = (userId) => `coachlens_teams_${userId}`;
const SETTINGS_KEY = (userId) => `coachlens_settings_${userId}`;

export function getTeams(userId) {
  try {
    const d = localStorage.getItem(TEAMS_KEY(userId));
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}
export function saveTeams(userId, teams) {
  localStorage.setItem(TEAMS_KEY(userId), JSON.stringify(teams));
  if (isSupabaseConfigured() && userId) {
    storageService.syncTeamsToSupabase(userId, teams);
  }
}
function getSettings(userId) {
  try {
    const d = localStorage.getItem(SETTINGS_KEY(userId));
    return d ? JSON.parse(d) : { defaultFormat: 'T20', notifications: { analysisComplete: true, weeklySummary: false } };
  } catch { return { defaultFormat: 'T20', notifications: { analysisComplete: true, weeklySummary: false } }; }
}
function saveSettings(userId, settings) {
  localStorage.setItem(SETTINGS_KEY(userId), JSON.stringify(settings));
}


const TEAM_EMOJIS = ['🏏', '⚡', '🔥', '🦁', '🐯', '🦅', '🌊', '🌪️', '💪', '🏆'];

/* ═══════════════════════════════════════════
   TEAMS PAGE
   ═══════════════════════════════════════════ */
export function Teams({ addToast }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', emoji: '🏏', logo: null });
  const [modalError, setModalError] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const handleLogoUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditingTeam(prev => prev ? { ...prev, logo: reader.result } : null);
      } else {
        setNewTeam(prev => ({ ...prev, logo: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const loadTeams = async () => {
    if (!user) return;
    const saved = getTeams(user.id);
    setTeams(saved);

    const allMatches = await storageService.getMatches();
    const stats = {};
    saved.forEach(team => {
      const tm = allMatches.filter(m => m.teamName === team.name);
      const won = tm.filter(m => m.result === 'Won').length;
      const playerNames = new Set((team.roster || []).map(p => p.name));
      tm.forEach(match => {
        (match.analysis?.players || []).forEach(p => playerNames.add(p.name));
      });
      // Calculate Weekly Improvement (Last 7 days vs previous 7 days)
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const thisWeekMatches = tm.filter(m => new Date(m.date) >= oneWeekAgo);
      const lastWeekMatches = tm.filter(m => new Date(m.date) >= twoWeeksAgo && new Date(m.date) < oneWeekAgo);

      const thisWeekWinRate = thisWeekMatches.length > 0 ? (thisWeekMatches.filter(m => m.result === 'Won').length / thisWeekMatches.length) * 100 : 0;
      const lastWeekWinRate = lastWeekMatches.length > 0 ? (lastWeekMatches.filter(m => m.result === 'Won').length / lastWeekMatches.length) * 100 : 0;
      
      let weeklyImprovement = 'flat';
      if (thisWeekMatches.length > 0 && lastWeekMatches.length > 0) {
        if (thisWeekWinRate > lastWeekWinRate) weeklyImprovement = 'up';
        if (thisWeekWinRate < lastWeekWinRate) weeklyImprovement = 'down';
      } else if (thisWeekMatches.length > 0 && thisWeekWinRate >= 50) {
        weeklyImprovement = 'up';
      } else if (thisWeekMatches.length > 0 && thisWeekWinRate < 50) {
        weeklyImprovement = 'down';
      }

      // Calculate form guide (last 3-5 matches)
      const formGuide = getTeamFormGuide(tm, tm[tm.length - 1]?.id).slice(-5);

      stats[team.id] = {
        matchCount: tm.length,
        won,
        lost: tm.filter(m => m.result === 'Lost').length,
        winRate: tm.length > 0 ? Math.round((won / tm.length) * 100) : null,
        rosterCount: playerNames.size,
        formGuide,
        weeklyImprovement,
      };
    });
    setTeamStats(stats);
  };

  useEffect(() => {
    if (!user) return;
    loadTeams();

    if (isSupabaseConfigured()) {
      storageService.fetchTeamsFromSupabase(user.id).then(dbTeams => {
        if (dbTeams && dbTeams.length > 0) {
          localStorage.setItem(`coachlens_teams_${user.id}`, JSON.stringify(dbTeams));
          loadTeams();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAdd = () => {
    setModalError('');
    if (!newTeam.name.trim()) return setModalError('Team name is required.');
    if (teams.find(t => t.name.toLowerCase() === newTeam.name.trim().toLowerCase()))
      return setModalError('A team with this name already exists.');

    const team = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: newTeam.name.trim(),
      emoji: newTeam.emoji,
      logo: newTeam.logo || null,
      roster: [],
      matches: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [team, ...teams];
    saveTeams(user.id, updated);
    setTeams(updated);
    setNewTeam({ name: '', emoji: '🏏', logo: null });
    setShowModal(false);
    addToast?.(`Team "${team.name}" created`, 'success');
    loadTeams();
  };

  const handleDelete = (id, name) => {
    const updated = teams.filter(t => t.id !== id);
    saveTeams(user.id, updated);
    setTeams(updated);
    addToast?.(`Team "${name}" deleted`, 'info');
  };

  const handleEditSave = async () => {
    setModalError('');
    if (!editingTeam.name.trim()) return setModalError('Team name is required.');
    
    if (teams.find(t => t.id !== editingTeam.id && t.name.toLowerCase() === editingTeam.name.trim().toLowerCase())) {
      return setModalError('A team with this name already exists.');
    }

    const oldTeam = teams.find(t => t.id === editingTeam.id);
    const oldName = oldTeam.name;
    const newName = editingTeam.name.trim();

    const updatedTeams = teams.map(t => 
      t.id === editingTeam.id ? { ...t, name: newName, emoji: editingTeam.emoji, logo: editingTeam.logo || null } : t
    );
    saveTeams(user.id, updatedTeams);
    setTeams(updatedTeams);

    // If name changed, update all existing matches to keep history linked
    if (oldName !== newName) {
      const allMatches = await storageService.getMatches();
      const changedMatches = allMatches.filter(m => m.teamName === oldName);
      await Promise.all(changedMatches.map(m =>
        storageService.updateMatch(m.id, { teamName: newName })
      ));
    }

    setEditingTeam(null);
    addToast?.('Team updated successfully', 'success');
    loadTeams();
  };

  const loadSampleTeams = async () => {
    const now = new Date();
    
    // 1. Create Sample Teams
    const sampleTeams = [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + '1',
        name: 'Vasco Vikings',
        emoji: '🌊',
        matches: 0,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        roster: [{ name: 'Sunil Chhetri', role: 'Batsman' }, { name: 'Gaurav Desai', role: 'Bowler' }, { name: 'Rohan Naik', role: 'Allrounder' }]
      },
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + '2',
        name: 'Mapusa Mavericks',
        emoji: '🦅',
        matches: 0,
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        roster: [{ name: 'Prathamesh Shet', role: 'Allrounder' }, { name: 'Amit Singh', role: 'Batsman' }]
      },
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + '3',
        name: 'Ponda Warriors',
        emoji: '🛡️',
        matches: 0,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        roster: [{ name: 'Deepak Kamat', role: 'Bowler' }]
      }
    ];

    // 2. Generate Random Matches for them
    const randomMatches = [];
    const results = ['Won', 'Lost', 'Won', 'Lost', 'Won', 'Won']; // Slight bias to winning
    const tags = ['Aggressor', 'Anchor', 'Liability', 'Improving'];
    
    const opponents = ['Margao XI', 'Panaji Lions', 'Bicholim Blasters', 'Sanguem Kings', 'Quepem Cavaliers'];
    const turningPoints = [
      'Over 14 — 3 consecutive dot balls turned pressure into a collapse.',
      'Over 8 — Partnership of 52 runs in 4 overs set a strong platform.',
      'Over 17 — 2 wickets in the over swung the match decisively.',
      'Over 6 — Powerplay strike rate of 145 put the opposition on the back foot.',
      'Over 19 — Yorker hat-trick sealed the death overs.'
    ];
    const partnerships = [
      'Opener partnership — 68 runs in 8 overs. Strong start.',
      'Middle-order rescue — 54 runs between #4 and #5, overs 10–15.',
      '3rd wicket stand — 72 runs. Dominated the spin in the middle overs.',
      'Opening pair — 45 runs in powerplay. Aggressive intent from ball one.',
      'Finisher duo — 38 off last 18 balls. Crucial death-over acceleration.'
    ];
    const bowlingNotes = [
      'Medium pacer leaked 42 runs in 3 overs (ER 14.0). No variation at death.',
      'Spinner conceded 3 boundaries in over 12. Overpitched repeatedly.',
      'None — bowling unit was clinical across all phases.',
      'Opening bowler went for 38 in 4 overs. Too short, no swing.',
      'Death bowler had ER 11.5 in final 2 overs. Needs yorker practice.'
    ];
    const patterns = [
      'Team scores 60% of runs in middle overs. Powerplay SR needs improvement to 130+.',
      'Consistent death-over collapse: avg 22 runs in overs 16–20 across last 3 games.',
      'Strong when chasing — 4/5 wins came batting second. Prefer to field first.',
      'Top order contributes 70% of runs. Lower order needs better finishing.',
      'Bowling is strongest in overs 7–12. Use best spinners in this phase.'
    ];
    const battingChanges = [
      'Promote the aggressive opener to #1. Current #3 drops to #5 due to low SR.',
      'No batting order changes needed — top 4 is settled and performing.',
      'Swap #3 and #5 — the finisher needs to come in earlier when chasing.',
      'Move the allrounder to #4. Provides stability if early wickets fall.',
      'Open with the pinch-hitter in powerplay-heavy matches.'
    ];
    const bowlingChanges = [
      'Restrict medium pacer to 2 overs max in death. Use spinner at overs 16–17.',
      'Give the left-arm spinner 4 full overs — most economical in the squad.',
      'Rotate 3 seamers: 2 overs each in death instead of relying on one.',
      'No changes — bowling rotation worked well this match.',
      'Drop the part-timer from bowling. Use as pure batsman.'
    ];
    const notices = [
      'Opener — 3 consecutive single-digit scores. One more failure = dropped.',
      'Spinner — ER above 10 in last 2 matches. Must improve or loses spot.',
      'No one on notice — squad is performing consistently.',
      '#5 batsman — SR of 85 in last 3 innings. Needs to accelerate or sit out.',
      'Allrounder — bowling has been expensive. Focus on batting role only.'
    ];
    const tacticals = [
      'Target powerplay SR of 130+ for top 3. Execute or restructure.',
      'Death over finishing: must score 35+ in overs 16–20.',
      'Improve running between wickets — 8 dot balls from poor rotation last match.',
      'Set field for yorkers in death overs. No short balls after over 17.',
      'Maintain current template — execution was near-perfect.'
    ];

    sampleTeams.forEach(team => {
      for(let i=0; i<5; i++) {
        const matchDate = new Date(now);
        matchDate.setDate(matchDate.getDate() - (i * 2 + 1));
        
        const playersAnalysis = team.roster.map(p => ({
          name: p.name,
          role: p.role,
          tag: tags[Math.floor(Math.random() * tags.length)],
          key_stat: `${Math.floor(Math.random() * 50 + 10)} (${Math.floor(Math.random() * 30 + 10)})`,
          match_impact: (Math.random() * 5 + 5).toFixed(1),
          what_worked: 'Solid contribution with both intent and execution.',
          what_failed: 'Needs to convert starts into bigger scores.',
          next_match_instruction: 'Focus on strike rotation in middle overs.',
          practice_drill: 'Net sessions targeting specific weak zones.'
        }));

        randomMatches.push({
          id: `sample-match-${team.id}-${i}`,
          date: matchDate.toISOString(),
          format: 'T20',
          phase: 'Full Match',
          teamName: team.name,
          opponent: opponents[i % opponents.length],
          result: results[Math.floor(Math.random() * results.length)],
          analysis: {
            players: playersAnalysis,
            team_summary: {
              what_won_lost_match: turningPoints[i % turningPoints.length],
              strongest_partnership: partnerships[i % partnerships.length],
              bowling_inefficiency: bowlingNotes[i % bowlingNotes.length],
              pattern: patterns[i % patterns.length]
            },
            coach_decisions: {
              batting_order_change: battingChanges[i % battingChanges.length],
              bowling_rotation: bowlingChanges[i % bowlingChanges.length],
              player_on_notice: notices[i % notices.length],
              tactical_focus_next_game: tacticals[i % tacticals.length]
            }
          },
          isDemo: true
        });
      }
    });

    // 3. Save matches via service layer
    await Promise.all(randomMatches.map(m => storageService.saveMatch(m)));

    // 4. Save teams
    const updatedTeams = [...sampleTeams, ...teams];
    saveTeams(user.id, updatedTeams);
    setTeams(updatedTeams);
    
    addToast?.('Added sample teams with match history!', 'success');
    loadTeams();
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-display-xl font-display text-textPrimary mb-2">My Teams</h1>
          <p className="text-textSecondary text-sm">Manage rosters, track match records, and drill into player analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadSampleTeams} className="flex items-center justify-center gap-2 bg-surface2 hover:bg-surface3 text-textPrimary px-4 py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all border border-border">
            <Users size={16} /> Samples
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white px-5 py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-accent btn-press">
            <Plus size={16} /> New Team
          </button>
        </div>
      </div>

      {teams.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 bg-surface2/50 p-2 rounded-xl border border-border">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textTertiary" />
            <input 
              type="text" 
              placeholder="Search teams by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface2 border border-border text-sm text-textPrimary placeholder:text-textTertiary rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div className="relative min-w-[160px]">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textTertiary pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-surface2 border border-border text-sm text-textPrimary rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
            >
              <option value="recent">Recently Created</option>
              <option value="name">Name (A-Z)</option>
              <option value="winrate">Highest Win %</option>
              <option value="matches">Most Matches</option>
            </select>
          </div>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🏏</div>
          <h3 className="text-lg font-display text-textPrimary mb-2">No teams yet</h3>
          <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto font-mono">Create your first team to start tracking rosters and performance trends.</p>
          <button onClick={() => setShowModal(true)} className="bg-accent hover:bg-accentHover text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-glow-accent">Create Team</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams
            .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
              const statsA = teamStats[a.id] || {};
              const statsB = teamStats[b.id] || {};
              if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
              if (sortBy === 'name') return a.name.localeCompare(b.name);
              if (sortBy === 'winrate') return (statsB.winRate || 0) - (statsA.winRate || 0);
              if (sortBy === 'matches') return (statsB.matchCount || 0) - (statsA.matchCount || 0);
              return 0;
            })
            .map((team) => {
            const s = teamStats[team.id] || {};
            return (
              <div key={team.id} className="glass-card rounded-2xl p-6 group transition-all hover:border-accent/30 flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      team.emoji || '🏏'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-display text-textPrimary truncate">{team.name}</h3>
                    <p className="text-xs text-textTertiary font-mono">Est. {formatDate(team.createdAt)}</p>
                  </div>
                  {s.weeklyImprovement === 'up' && <div className="px-2 py-1 rounded-lg bg-aggressor-bg/30 border border-aggressor-border/50 text-aggressor-text text-[10px] font-mono font-bold flex items-center gap-1"><TrendingUp size={10} /> Improving</div>}
                  {s.weeklyImprovement === 'down' && <div className="px-2 py-1 rounded-lg bg-liability-bg/30 border border-liability-border/50 text-liability-text text-[10px] font-mono font-bold flex items-center gap-1"><TrendingDown size={10} /> Slump</div>}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setEditingTeam({ id: team.id, name: team.name, emoji: team.emoji, logo: team.logo || null })} className="p-2 rounded-lg text-textTertiary hover:text-textPrimary hover:bg-surface3 transition-colors" title="Edit team"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(team.id, team.name)} className="p-2 rounded-lg text-textTertiary hover:text-liability-text hover:bg-liability-bg/50 transition-colors" title="Delete team"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  <div className="bg-surface2 p-2.5 rounded-xl border border-border text-center">
                    <div className="text-[9px] text-textTertiary uppercase font-mono mb-0.5">Players</div>
                    <div className="text-lg font-display text-textPrimary">{s.rosterCount ?? (team.roster?.length || 0)}</div>
                  </div>
                  <div className="bg-surface2 p-2.5 rounded-xl border border-border text-center">
                    <div className="text-[9px] text-textTertiary uppercase font-mono mb-0.5">Matches</div>
                    <div className="text-lg font-display text-textPrimary">{s.matchCount ?? 0}</div>
                  </div>
                  <div className="bg-aggressor-bg/50 p-2.5 rounded-xl border border-aggressor-border/30 text-center">
                    <div className="text-[9px] text-textTertiary uppercase font-mono mb-0.5">Won</div>
                    <div className="text-lg font-display text-aggressor-text">{s.won ?? 0}</div>
                  </div>
                  <div className="bg-surface2 p-2.5 rounded-xl border border-border text-center">
                    <div className="text-[9px] text-textTertiary uppercase font-mono mb-0.5">Win %</div>
                    <div className="text-lg font-display text-accent">{s.winRate != null ? `${s.winRate}%` : '--'}</div>
                  </div>
                </div>

                {s.formGuide && s.formGuide.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 bg-surface2/50 p-2 rounded-xl border border-border">
                    <span className="text-[10px] font-mono text-textSecondary uppercase tracking-wider">Weekly Form:</span>
                    <div className="flex gap-1">
                      {s.formGuide.map((res, i) => (
                        <span key={i} className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold ${res === 'W' ? 'bg-aggressor-bg text-aggressor-text border border-aggressor-border' : 'bg-liability-bg text-liability-text border border-liability-border'}`}>
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {team.roster && team.roster.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {team.roster.slice(0, 6).map(p => (
                      <span key={p.name} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface2 border border-border text-textSecondary">{p.name}</span>
                    ))}
                    {team.roster.length > 6 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent">+{team.roster.length - 6} more</span>
                    )}
                  </div>
                )}

                <div className="mt-auto">
                  <Link to={`/teams/${encodeURIComponent(team.name)}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface2 hover:bg-surface3 text-textPrimary text-xs font-mono font-bold uppercase tracking-wider transition-all border border-border group-hover:border-accent/30">
                    Open Team Profile <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative modal-card rounded-2xl p-8 w-full max-w-md border border-border animate-scale-pop">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-textTertiary hover:text-textPrimary transition-colors"><X size={16} /></button>
            <h2 className="text-xl font-display text-textPrimary mb-6">Create New Team</h2>
            {modalError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-liability-bg/50 border border-liability-border text-liability-text text-sm"><AlertCircle size={14} />{modalError}</div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Team Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {TEAM_EMOJIS.map(e => (
                    <button key={e} onClick={() => setNewTeam(p => ({...p, emoji: e}))}
                      className={`w-10 h-10 rounded-xl text-xl transition-all ${newTeam.emoji === e ? 'bg-accent/20 border-2 border-accent scale-110' : 'bg-surface2 border border-border hover:border-accent/40'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest block">Team Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-surface2 border border-border flex items-center justify-center text-2xl shrink-0 overflow-hidden relative group">
                    {newTeam.logo ? (
                      <>
                        <img src={newTeam.logo} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewTeam(p => ({ ...p, logo: null }))}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono uppercase"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span className="text-textTertiary">📷</span>
                    )}
                  </div>
                  <label className="cursor-pointer bg-surface2 hover:bg-surface3 border border-border text-textSecondary hover:text-textPrimary px-4 py-2.5 rounded-xl text-xs font-mono transition-colors uppercase tracking-wider">
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Team Name</label>
                <input
                  value={newTeam.name}
                  onChange={e => { setNewTeam(p => ({...p, name: e.target.value})); setModalError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="e.g. Panaji Panthers"
                  autoFocus
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
              <button onClick={handleAdd} className="w-full bg-accent hover:bg-accentHover text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-accent btn-press mt-2">
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setEditingTeam(null)} />
          <div className="relative modal-card rounded-2xl p-8 w-full max-w-md border border-border animate-scale-pop">
            <button onClick={() => setEditingTeam(null)} className="absolute top-4 right-4 p-2 text-textTertiary hover:text-textPrimary transition-colors"><X size={16} /></button>
            <h2 className="text-xl font-display text-textPrimary mb-6">Edit Team</h2>
            {modalError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-liability-bg/50 border border-liability-border text-liability-text text-sm"><AlertCircle size={14} />{modalError}</div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Team Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {TEAM_EMOJIS.map(e => (
                    <button key={e} onClick={() => setEditingTeam(p => ({...p, emoji: e}))}
                      className={`w-10 h-10 rounded-xl text-xl transition-all ${editingTeam.emoji === e ? 'bg-accent/20 border-2 border-accent scale-110' : 'bg-surface2 border border-border hover:border-accent/40'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest block">Team Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-surface2 border border-border flex items-center justify-center text-2xl shrink-0 overflow-hidden relative group">
                    {editingTeam.logo ? (
                      <>
                        <img src={editingTeam.logo} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditingTeam(p => ({ ...p, logo: null }))}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono uppercase"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span className="text-textTertiary">📷</span>
                    )}
                  </div>
                  <label className="cursor-pointer bg-surface2 hover:bg-surface3 border border-border text-textSecondary hover:text-textPrimary px-4 py-2.5 rounded-xl text-xs font-mono transition-colors uppercase tracking-wider">
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Team Name</label>
                <input
                  value={editingTeam.name}
                  onChange={e => { setEditingTeam(p => ({...p, name: e.target.value})); setModalError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleEditSave()}
                  autoFocus
                  placeholder="e.g. Mumbai Indians"
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button onClick={() => setEditingTeam(null)} className="py-3 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textPrimary text-sm font-mono font-bold uppercase tracking-wider transition-all">Cancel</button>
                <button onClick={handleEditSave} className="py-3 rounded-xl bg-accent hover:bg-accentHover text-white text-sm font-mono font-bold uppercase tracking-wider transition-all shadow-glow-accent btn-press">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════ */
const ROLES = ['Head Coach', 'Assistant Coach', 'Captain', 'Team Manager', 'Analyst'];
const EXPERIENCE = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

export function Settings({ addToast }) {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const plan = useContext(PlanContext);
  const [profile, setProfile] = useState({ fullName: '', email: '', organization: '', role: '', experience: '' });
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' });
  const [prefs, setPrefs] = useState({ defaultFormat: 'T20', notifications: { analysisComplete: true, weeklySummary: false } });
  const [saving, setSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  useEffect(() => {
    if (user) {
      setProfile({ fullName: user.fullName || '', email: user.email || '', organization: user.organization || '', role: user.role || 'Head Coach', experience: user.experience || '1-3 years' });
      setPrefs(getSettings(user.id));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    const result = updateProfile({ fullName: profile.fullName, email: profile.email, organization: profile.organization, role: profile.role, experience: profile.experience });
    setSaving(false);
    if (result.success) addToast?.('Profile updated successfully', 'success');
    else addToast?.(result.error, 'error');
  };

  const handleSavePrefs = () => {
    if (user) saveSettings(user.id, prefs);
    addToast?.('Preferences saved', 'success');
  };

  const handleChangePassword = () => {
    setPwdError('');
    if (!passwords.current) return setPwdError('Current password is required.');
    if (!passwords.newPwd) return setPwdError('New password is required.');
    if (passwords.newPwd.length < 6) return setPwdError('New password must be at least 6 characters.');
    if (passwords.newPwd !== passwords.confirm) return setPwdError('New passwords do not match.');
    const result = changePassword(passwords.current, passwords.newPwd);
    if (result.success) {
      addToast?.('Password changed successfully', 'success');
      setPasswords({ current: '', newPwd: '', confirm: '' });
    } else {
      setPwdError(result.error);
    }
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    addToast?.('Account deleted', 'info');
  };

  const handleClearData = () => {
    localStorage.removeItem('coachlens_matches');
    localStorage.removeItem('coachlens_seeded');
    if (user) {
      localStorage.removeItem(TEAMS_KEY(user.id));
      localStorage.removeItem(SETTINGS_KEY(user.id));
    }
    addToast?.('All app data cleared', 'success');
  };



  const SectionHeader = ({ icon, title }) => (
    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-textTertiary flex items-center gap-2 mb-4">{icon} {title}</h3>
  );

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-display-xl font-display text-textPrimary mb-2">Settings</h1>
        <p className="text-textSecondary text-sm">Configure your coaching profile and application preferences.</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <SectionHeader icon={<User size={12} />} title="Profile Information" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 p-4 bg-surface2 rounded-xl border border-border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center text-accent font-mono font-bold text-xl">{user?.avatar || '?'}</div>
              <div>
                <div className="font-medium text-textPrimary">{profile.fullName || 'Your Name'}</div>
                <div className="text-xs text-textTertiary font-mono">{profile.email}</div>
                <div className="text-[10px] text-accent font-mono mt-0.5">{profile.role} · {profile.experience}</div>
              </div>
            </div>
            <div className="self-start sm:self-center">
              {isSupabaseConfigured() ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-aggressor-bg/20 border border-aggressor-border/30 text-aggressor-text shadow-[0_0_10px_rgba(34,197,94,0.05)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-aggressor-text animate-pulse" />
                  Cloud Sync Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-surface3 border border-border text-textTertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-textTertiary" />
                  Local Cache Mode
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-textSecondary uppercase font-mono">Full Name</label>
              <input type="text" value={profile.fullName} onChange={e => setProfile(p => ({...p, fullName: e.target.value}))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-textSecondary uppercase font-mono">Email</label>
              <input type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-textSecondary uppercase font-mono">Organization</label>
              <input type="text" value={profile.organization} onChange={e => setProfile(p => ({...p, organization: e.target.value}))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-textSecondary uppercase font-mono">Role</label>
              <select value={profile.role} onChange={e => setProfile(p => ({...p, role: e.target.value}))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] text-textSecondary uppercase font-mono">Experience</label>
              <select value={profile.experience} onChange={e => setProfile(p => ({...p, experience: e.target.value}))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer">
                {EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border">
          <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-accent hover:bg-accentHover disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-accent btn-press">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>



      <div className="glass-card rounded-2xl p-6 space-y-4">
        <SectionHeader icon={<Palette size={12} />} title="Preferences" />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface2 rounded-xl border border-border">
            <div><div className="text-sm font-medium text-textPrimary">Default Match Format</div><div className="text-[10px] text-textTertiary font-mono">Used when creating new analyses</div></div>
            <select value={prefs.defaultFormat} onChange={e => setPrefs(p => ({...p, defaultFormat: e.target.value}))} className="bg-surface3 border border-border rounded-lg px-3 py-1.5 text-xs text-textPrimary font-mono focus:outline-none focus:border-accent appearance-none cursor-pointer">
              <option value="T20">T20</option><option value="ODI">ODI</option><option value="Test">Test</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface2 rounded-xl border border-border">
            <div><div className="text-sm font-medium text-textPrimary">Analysis Notifications</div><div className="text-[10px] text-textTertiary font-mono">Get notified when analysis completes</div></div>
            <button onClick={() => setPrefs(p => ({...p, notifications: {...p.notifications, analysisComplete: !p.notifications.analysisComplete}}))} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${prefs.notifications.analysisComplete ? 'bg-accent' : 'bg-surface3 border border-border'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${prefs.notifications.analysisComplete ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface2 rounded-xl border border-border">
            <div><div className="text-sm font-medium text-textPrimary">Weekly Summary</div><div className="text-[10px] text-textTertiary font-mono">Receive a weekly performance digest</div></div>
            <button onClick={() => setPrefs(p => ({...p, notifications: {...p.notifications, weeklySummary: !p.notifications.weeklySummary}}))} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${prefs.notifications.weeklySummary ? 'bg-accent' : 'bg-surface3 border border-border'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${prefs.notifications.weeklySummary ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
        <button onClick={handleSavePrefs} className="w-full bg-surface2 hover:bg-surface3 border border-border text-textPrimary py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all">Save Preferences</button>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <SectionHeader icon={<Key size={12} />} title="Change Password" />
        {pwdError && <div className="flex items-center gap-2 p-3 rounded-xl bg-liability-bg/50 border border-liability-border text-liability-text text-sm"><AlertCircle size={14} />{pwdError}</div>}
        <div className="space-y-3">
          <input type="password" placeholder="Current password" value={passwords.current} onChange={e => { setPasswords(p => ({...p, current: e.target.value})); setPwdError(''); }} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-all" />
          <input type="password" placeholder="New password (min 6 chars)" value={passwords.newPwd} onChange={e => setPasswords(p => ({...p, newPwd: e.target.value}))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-all" />
          <input type="password" placeholder="Confirm new password" value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-all" />
        </div>
        <button onClick={handleChangePassword} className="w-full bg-surface2 hover:bg-surface3 border border-border text-textPrimary py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all">Update Password</button>
      </div>

      <div className={`glass-card rounded-2xl p-6 space-y-4 ${plan?.isPaid ? 'border border-aggressor-border/40' : 'border border-accent/20'}`}>
        <SectionHeader icon={<Zap size={12} />} title="Plan & Upgrade" />
        {plan?.isPaid ? (
          <div className="flex items-center gap-4 p-4 bg-aggressor-bg/30 border border-aggressor-border/40 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-aggressor-text/10 border border-aggressor-border flex items-center justify-center text-lg">✓</div>
            <div>
              <div className="text-sm font-bold text-aggressor-text font-mono">Team Plan Active</div>
              <div className="text-[11px] text-textTertiary font-mono mt-0.5">All features unlocked · Coach Brief available</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-surface2 rounded-xl border border-border">
              <div>
                <div className="text-sm font-medium text-textPrimary">Free Tier</div>
                <div className="text-[11px] text-textTertiary font-mono mt-0.5">
                  {plan?.analysisCount ?? 0} / {plan?.FREE_LIMIT ?? 3} analyses used · Coach Brief locked
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-improving-bg border border-improving-border text-improving-text">Free</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="settings-upgrade-btn"
                onClick={() => plan?.openUpgradeModal?.()}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-primary py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all"
              >
                <Zap size={13} /> Get Team Plan
              </button>
              <button
                id="settings-promo-btn"
                onClick={() => plan?.openPromoModal?.()}
                className="flex items-center justify-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all"
              >
                <Key size={13} /> Promo Code
              </button>
            </div>
          </>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4 border-liability-border/30">
        <SectionHeader icon={<Shield size={12} />} title="Danger Zone" />
        <div className="space-y-3">
          <button onClick={handleClearData} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-improving-border text-improving-text hover:bg-improving-bg/30 text-sm font-mono font-bold uppercase tracking-wider transition-all">Clear All App Data</button>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-liability-border text-liability-text hover:bg-liability-bg/30 text-sm font-mono font-bold uppercase tracking-wider transition-all">Delete Account</button>
          ) : (
            <div className="p-4 bg-liability-bg/20 border border-liability-border rounded-xl space-y-3 animate-scale-pop">
              <p className="text-sm text-liability-text font-mono">Are you sure? This will permanently delete your account and all data. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-surface2 border border-border text-textPrimary text-sm font-mono font-bold transition-all">Cancel</button>
                <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-xl bg-liability-text text-white text-sm font-mono font-bold transition-all">Yes, Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default export router for React.lazy — renders Teams or Settings by page prop
export default function AppPages({ page, addToast }) {
  if (page === 'settings') return <Settings addToast={addToast} />;
  return <Teams addToast={addToast} />;
}
