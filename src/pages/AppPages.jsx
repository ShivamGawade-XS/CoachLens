import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Shield, ArrowRight, Plus, X, Trash2, ChevronDown, ChevronUp, AlertCircle, User, Bell, Monitor, Key, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

/* ═══════════════════════════════════════════
   TEAMS PAGE
   ═══════════════════════════════════════════ */
export default function Teams({ addToast }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', players: '' });
  const [expanded, setExpanded] = useState(null);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (user) setTeams(getTeams(user.id));
  }, [user]);

  const handleAdd = () => {
    setModalError('');
    if (!newTeam.name.trim()) return setModalError('Team name is required.');
    const playerCount = parseInt(newTeam.players) || 11;
    if (playerCount < 2 || playerCount > 30) return setModalError('Players must be between 2 and 30.');

    const team = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: newTeam.name.trim(),
      players: playerCount,
      roster: [], // manual roster entries
      matches: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [team, ...teams];
    saveTeams(user.id, updated);
    setTeams(updated);
    setNewTeam({ name: '', players: '' });
    setShowModal(false);
    addToast?.(`Team "${team.name}" created`, 'success');
  };

  const handleDelete = (id, name) => {
    const updated = teams.filter(t => t.id !== id);
    saveTeams(user.id, updated);
    setTeams(updated);
    addToast?.(`Team "${name}" deleted`, 'info');
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-display-xl font-display text-textPrimary mb-2">My Teams</h1>
          <p className="text-textSecondary text-sm">Manage your rosters and view team-wide performance trends.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white px-5 py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press">
          <Plus size={16} /> Add Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface2 border border-border flex items-center justify-center mx-auto mb-4 text-textTertiary"><Trophy size={24} /></div>
          <h3 className="text-lg font-display text-textPrimary mb-2">No teams yet</h3>
          <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto">Create your first team to start tracking rosters and match performance.</p>
          <button onClick={() => setShowModal(true)} className="bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all">Create Team</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="glass-card rounded-2xl p-6 group transition-all hover:border-accent/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent"><Users size={24} /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-display text-textPrimary truncate">{team.name}</h3>
                  <p className="text-xs text-textTertiary font-mono">Created {formatDate(team.createdAt)}</p>
                </div>
                <button onClick={() => handleDelete(team.id, team.name)} className="p-2 rounded-lg text-textTertiary hover:text-liability-text hover:bg-liability-bg/50 opacity-0 group-hover:opacity-100 transition-all" title="Delete team"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface2 p-3 rounded-xl border border-border">
                  <div className="text-[10px] text-textTertiary uppercase font-mono mb-1">Players</div>
                  <div className="text-xl font-display text-textPrimary">{team.players}</div>
                </div>
                <div className="bg-surface2 p-3 rounded-xl border border-border">
                  <div className="text-[10px] text-textTertiary uppercase font-mono mb-1">Analyses</div>
                  <div className="text-xl font-display text-textPrimary">{team.matches}</div>
                </div>
              </div>
              <Link to={`/teams/${encodeURIComponent(team.name)}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface2 hover:bg-surface3 text-textPrimary text-xs font-mono font-bold uppercase tracking-wider transition-all border border-border">
                View Team Profile <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Team Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card rounded-2xl p-8 w-full max-w-md border border-border animate-scale-pop">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-textTertiary hover:text-textPrimary transition-colors"><X size={16} /></button>
            <h2 className="text-xl font-display text-textPrimary mb-6">Create New Team</h2>
            {modalError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-liability-bg/50 border border-liability-border text-liability-text text-sm"><AlertCircle size={14} />{modalError}</div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Team Name</label>
                <input value={newTeam.name} onChange={e => { setNewTeam(p => ({...p, name: e.target.value})); setModalError(''); }} placeholder="Panaji Panthers" className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Number of Players</label>
                <input type="number" min="2" max="30" value={newTeam.players} onChange={e => setNewTeam(p => ({...p, players: e.target.value}))} placeholder="11" className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
              </div>
              <button onClick={handleAdd} className="w-full bg-accent hover:bg-accentHover text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press">Create Team</button>
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
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
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

      {/* ── Profile Info ── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <SectionHeader icon={<User size={12} />} title="Profile Information" />
          <div className="flex items-center gap-4 mb-4 p-4 bg-surface2 rounded-xl border border-border">
            <div className="w-14 h-14 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center text-accent font-mono font-bold text-xl">{user?.avatar || '?'}</div>
            <div>
              <div className="font-medium text-textPrimary">{profile.fullName || 'Your Name'}</div>
              <div className="text-xs text-textTertiary font-mono">{profile.email}</div>
              <div className="text-[10px] text-accent font-mono mt-0.5">{profile.role} · {profile.experience}</div>
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
          <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-accent hover:bg-accentHover disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* ── Preferences ── */}
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

      {/* ── Change Password ── */}
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

      {/* ── Danger Zone ── */}
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
