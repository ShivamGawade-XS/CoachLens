import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, ChevronRight, Activity, Plus, X, AlertCircle, Trash2, Phone, Hash, Edit2, Check, Copy, MessageSquare } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { getTeams, saveTeams } from './AppPages';

export default function TeamProfile() {
  const { teamId } = useParams();
  const teamName = decodeURIComponent(teamId);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [matches, setMatches] = useState([]);
  const [roster, setRoster] = useState([]);
  const [stats, setStats] = useState({ won: 0, lost: 0, total: 0 });
  const [teamObj, setTeamObj] = useState(null);
  const [copied, setCopied] = useState(false);

  // Add Player Modal
  const [showModal, setShowModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', role: 'Batsman', jerseyNo: '', phone: '' });
  const [modalError, setModalError] = useState('');

  // Edit Player Modal
  const [editPlayer, setEditPlayer] = useState(null);

  const loadData = async () => {
    if (!user) return;
    const allTeams = getTeams(user.id);
    const currentTeam = allTeams.find(t => t.name === teamName);
    setTeamObj(currentTeam);

    const allMatches = await storageService.getMatches();
    const teamMatches = allMatches.filter(m => m.teamName === teamName);
    setMatches(teamMatches.sort((a, b) => new Date(b.date) - new Date(a.date)));

    let won = 0, lost = 0;
    teamMatches.forEach(m => {
      if (m.result === 'Won') won++;
      if (m.result === 'Lost') lost++;
    });
    setStats({ won, lost, total: teamMatches.length });

    // Merge manual + dynamic rosters
    const playersMap = new Map();
    if (currentTeam?.roster) {
      currentTeam.roster.forEach(p => {
        playersMap.set(p.name, { ...p, appearances: 0, lastTag: 'Untested' });
      });
    }
    teamMatches.forEach(match => {
      (match.analysis?.players || []).forEach(p => {
        if (!playersMap.has(p.name)) {
          playersMap.set(p.name, { name: p.name, role: p.role, jerseyNo: '', phone: '', appearances: 1, lastTag: p.tag });
        } else {
          const ex = playersMap.get(p.name);
          ex.appearances = (ex.appearances || 0) + 1;
          ex.lastTag = p.tag;
        }
      });
    });
    setRoster(Array.from(playersMap.values()).sort((a, b) => b.appearances - a.appearances));
  };

  useEffect(() => { loadData(); }, [teamName, user]);

  const handleAddPlayer = () => {
    setModalError('');
    if (!newPlayer.name.trim()) return setModalError('Player name is required.');
    if (roster.find(p => p.name.toLowerCase() === newPlayer.name.trim().toLowerCase()))
      return setModalError('This player already exists in the roster.');

    const allTeams = getTeams(user.id);
    const idx = allTeams.findIndex(t => t.name === teamName);
    if (idx === -1) return setModalError('Team not found. Please go back and reopen.');

    const entry = { name: newPlayer.name.trim(), role: newPlayer.role, jerseyNo: newPlayer.jerseyNo.trim(), phone: newPlayer.phone.trim() };
    allTeams[idx].roster = [...(allTeams[idx].roster || []), entry];
    saveTeams(user.id, allTeams);
    setNewPlayer({ name: '', role: 'Batsman', jerseyNo: '', phone: '' });
    setShowModal(false);
    loadData();
  };

  const handleRemovePlayer = (name) => {
    const allTeams = getTeams(user.id);
    const idx = allTeams.findIndex(t => t.name === teamName);
    if (idx === -1) return;
    allTeams[idx].roster = (allTeams[idx].roster || []).filter(p => p.name !== name);
    saveTeams(user.id, allTeams);
    loadData();
  };

  const handleSaveEdit = () => {
    if (!editPlayer) return;
    const allTeams = getTeams(user.id);
    const idx = allTeams.findIndex(t => t.name === teamName);
    if (idx === -1) return;
    allTeams[idx].roster = (allTeams[idx].roster || []).map(p =>
      p.name === editPlayer.originalName ? { name: editPlayer.name, role: editPlayer.role, jerseyNo: editPlayer.jerseyNo, phone: editPlayer.phone } : p
    );
    saveTeams(user.id, allTeams);
    setEditPlayer(null);
    loadData();
  };

  const handleWhatsAppAll = () => {
    const rosterText = roster.map((p, i) => `${i + 1}. ${p.name} (${p.role})`).join('\n');
    const text = `📋 *${teamName} - Team Lineup*\n\n${rosterText}\n\n_Sent via CoachLens_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLineup = () => {
    const text = roster.map((p, i) => `${i + 1}. ${p.name}${p.jerseyNo ? ` #${p.jerseyNo}` : ''} - ${p.role}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTagColor = (tag) => {
    if (tag === 'Aggressor') return 'text-aggressor-text bg-aggressor-bg border-aggressor-border';
    if (tag === 'Anchor') return 'text-anchor-text bg-anchor-bg border-anchor-border';
    if (tag === 'Liability') return 'text-liability-text bg-liability-bg border-liability-border';
    if (tag === 'Improving') return 'text-improving-text bg-improving-bg border-improving-border';
    return 'text-textTertiary bg-surface2 border-border';
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/teams')} className="p-2 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textSecondary hover:text-textPrimary transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{teamObj?.emoji || '🏏'}</span>
            <div>
              <h1 className="text-display-lg font-display text-textPrimary">{teamName}</h1>
              <p className="text-sm font-mono text-textSecondary">Team Profile · {roster.length} Players</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyLineup} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textSecondary text-xs font-mono uppercase tracking-wider transition-all">
            {copied ? <Check size={13} className="text-aggressor-text" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy Lineup'}
          </button>
          <button onClick={handleWhatsAppAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aggressor-bg hover:bg-aggressor-bg/80 border border-aggressor-border text-aggressor-text text-xs font-mono uppercase tracking-wider transition-all">
            <MessageSquare size={13} /> Share Lineup
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl text-center">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-2 flex items-center justify-center gap-1"><Activity size={12} /> Matches</div>
          <div className="text-3xl font-display text-textPrimary">{stats.total}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl text-center border-aggressor-border/30">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-2 flex items-center justify-center gap-1"><Trophy size={12} className="text-aggressor-text" /> Won</div>
          <div className="text-3xl font-display text-aggressor-text">{stats.won}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl text-center border-liability-border/30">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-2 flex items-center justify-center gap-1"><Trophy size={12} className="text-liability-text" /> Lost</div>
          <div className="text-3xl font-display text-liability-text">{stats.lost}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl text-center border-accent/20">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-2 flex items-center justify-center gap-1"><Users size={12} className="text-accent" /> Squad</div>
          <div className="text-3xl font-display text-accent">{roster.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Roster (2/3) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display text-textPrimary flex items-center gap-2">
              <Users size={18} className="text-accent" /> Active Roster
            </h2>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press">
              <Plus size={13} /> Add Player
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            {roster.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">🏏</div>
                <h3 className="font-display text-textPrimary mb-2">No players yet</h3>
                <p className="text-textSecondary text-sm font-mono mb-4">Add players manually or analyze a match scorecard to auto-build your roster.</p>
                <button onClick={() => setShowModal(true)} className="bg-accent hover:bg-accentHover text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-glow-amber">Add First Player</button>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-surface2 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-[9px] uppercase font-mono tracking-wider text-textTertiary">#</th>
                    <th className="px-4 py-3 text-[9px] uppercase font-mono tracking-wider text-textTertiary">Player</th>
                    <th className="px-4 py-3 text-[9px] uppercase font-mono tracking-wider text-textTertiary hidden sm:table-cell">Role</th>
                    <th className="px-4 py-3 text-[9px] uppercase font-mono tracking-wider text-textTertiary text-center hidden md:table-cell">Apps</th>
                    <th className="px-4 py-3 text-[9px] uppercase font-mono tracking-wider text-textTertiary text-center">Form</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roster.map((player, idx) => (
                    <tr key={player.name} className="hover:bg-surface2/40 transition-colors group">
                      <td className="px-4 py-3.5 text-xs font-mono text-textTertiary">
                        {player.jerseyNo ? <span className="text-accent font-bold">#{player.jerseyNo}</span> : <span className="text-textTertiary">{idx + 1}</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-display text-textPrimary text-sm leading-tight">{player.name}</div>
                        {player.phone && (
                          <a href={`https://wa.me/91${player.phone}`} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-aggressor-text hover:underline flex items-center gap-0.5 mt-0.5">
                            <Phone size={9} /> {player.phone}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-textSecondary hidden sm:table-cell">{player.role}</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-textPrimary text-center hidden md:table-cell">{player.appearances}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border whitespace-nowrap ${getTagColor(player.lastTag)}`}>
                          {player.lastTag}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/player/${encodeURIComponent(player.name)}`} className="p-1.5 rounded-lg text-accent hover:bg-accent/10 transition-colors" title="View Profile">
                            <ChevronRight size={13} />
                          </Link>
                          <button onClick={() => setEditPlayer({ ...player, originalName: player.name })} className="p-1.5 rounded-lg text-textTertiary hover:text-textPrimary hover:bg-surface3 transition-colors" title="Edit">
                            <Edit2 size={13} />
                          </button>
                          {teamObj?.roster?.find(p => p.name === player.name) && (
                            <button onClick={() => handleRemovePlayer(player.name)} className="p-1.5 rounded-lg text-textTertiary hover:text-liability-text hover:bg-liability-bg/40 transition-colors" title="Remove">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Match History (1/3) */}
        <div className="space-y-4">
          <h2 className="text-lg font-display text-textPrimary">Match History</h2>
          <div className="space-y-3">
            {matches.slice(0, 6).map(match => (
              <Link key={match.id} to={`/match/${match.id}`} className="block glass-card p-4 rounded-xl hover:border-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${match.result === 'Won' ? 'bg-aggressor-bg text-aggressor-text border-aggressor-border' : 'bg-liability-bg text-liability-text border-liability-border'}`}>
                    {match.result}
                  </span>
                  <span className="text-xs font-mono text-textTertiary">{new Date(match.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
                <h4 className="font-display text-sm text-textPrimary truncate">vs {match.opponent}</h4>
                <p className="text-[10px] font-mono text-textSecondary mt-0.5">{match.format}</p>
              </Link>
            ))}
            {matches.length === 0 && (
              <div className="text-sm font-mono text-textSecondary text-center p-5 border border-dashed border-border rounded-xl">No match history yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Player Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card rounded-2xl p-8 w-full max-w-md border border-border animate-scale-pop">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-textTertiary hover:text-textPrimary"><X size={16} /></button>
            <h2 className="text-xl font-display text-textPrimary mb-1">Add Player</h2>
            <p className="text-xs font-mono text-textSecondary mb-6">Add to {teamName} roster</p>
            {modalError && <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-liability-bg/50 border border-liability-border text-liability-text text-sm"><AlertCircle size={14} />{modalError}</div>}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Player Name *</label>
                <input autoFocus value={newPlayer.name} onChange={e => { setNewPlayer(p => ({...p, name: e.target.value})); setModalError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                  placeholder="e.g. Rohit Sharma"
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Role *</label>
                  <select value={newPlayer.role} onChange={e => setNewPlayer(p => ({...p, role: e.target.value}))}
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none">
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="Allrounder">Allrounder</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest flex items-center gap-1"><Hash size={9} /> Jersey No.</label>
                  <input type="number" min="1" max="99" value={newPlayer.jerseyNo} onChange={e => setNewPlayer(p => ({...p, jerseyNo: e.target.value}))}
                    placeholder="e.g. 18"
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest flex items-center gap-1"><Phone size={9} /> WhatsApp Number (optional)</label>
                <input type="tel" value={newPlayer.phone} onChange={e => setNewPlayer(p => ({...p, phone: e.target.value}))}
                  placeholder="10-digit mobile number"
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
                <p className="text-[10px] font-mono text-textTertiary">Used to send coaching feedback directly via WhatsApp</p>
              </div>
              <button onClick={handleAddPlayer} className="w-full bg-accent hover:bg-accentHover text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press">Add to Roster</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setEditPlayer(null)} />
          <div className="relative glass-card rounded-2xl p-8 w-full max-w-md border border-border animate-scale-pop">
            <button onClick={() => setEditPlayer(null)} className="absolute top-4 right-4 p-2 text-textTertiary hover:text-textPrimary"><X size={16} /></button>
            <h2 className="text-xl font-display text-textPrimary mb-6">Edit Player</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Player Name</label>
                <input value={editPlayer.name} onChange={e => setEditPlayer(p => ({...p, name: e.target.value}))}
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Role</label>
                  <select value={editPlayer.role} onChange={e => setEditPlayer(p => ({...p, role: e.target.value}))}
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-accent appearance-none">
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="Allrounder">Allrounder</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Jersey No.</label>
                  <input type="number" value={editPlayer.jerseyNo || ''} onChange={e => setEditPlayer(p => ({...p, jerseyNo: e.target.value}))}
                    placeholder="e.g. 18"
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">WhatsApp Number</label>
                <input type="tel" value={editPlayer.phone || ''} onChange={e => setEditPlayer(p => ({...p, phone: e.target.value}))}
                  placeholder="10-digit mobile number"
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setEditPlayer(null)} className="py-3 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textPrimary text-sm font-mono font-bold uppercase tracking-wider transition-all">Cancel</button>
                <button onClick={handleSaveEdit} className="py-3 rounded-xl bg-accent hover:bg-accentHover text-white text-sm font-mono font-bold uppercase tracking-wider transition-all shadow-glow-amber btn-press">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
