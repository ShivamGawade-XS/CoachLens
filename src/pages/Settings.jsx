import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings({ addToast }) {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate from current user
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setOrganization(user.organization || '');
      setRole(user.role || 'Head Coach');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      addToast('Name cannot be empty.', 'error');
      return;
    }
    setProfileSaving(true);
    const result = updateProfile({ fullName: fullName.trim(), organization: organization.trim(), role });
    setProfileSaving(false);
    if (result.success) {
      addToast('Profile updated successfully.', 'success');
    } else {
      addToast(result.error || 'Failed to update profile.', 'error');
    }
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (!currentPw || !newPw || !confirmPw) {
      setPwError('All fields are required.');
      return;
    }
    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    const result = changePassword(currentPw, newPw);
    setPwSaving(false);
    if (result.success) {
      addToast('Password changed successfully.', 'success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } else {
      setPwError(result.error || 'Failed to change password.');
    }
  };

  const handleDeleteAccount = () => {
    const result = deleteAccount();
    if (result.success) {
      navigate('/');
    } else {
      addToast('Failed to delete account.', 'error');
    }
  };

  const ROLES = ['Head Coach', 'Assistant Coach', 'Batting Coach', 'Bowling Coach', 'Fielding Coach', 'Analyst'];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-display text-textPrimary">Settings</h1>
        <p className="text-textSecondary text-sm mt-1">Manage your coaching profile and account security.</p>
      </header>

      {/* Profile */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <User size={15} />
          </div>
          <h2 className="text-sm font-mono uppercase tracking-wider text-textPrimary font-bold">Profile Information</h2>
        </div>

        {/* Avatar preview */}
        {user && (
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-display text-xl font-bold">
              {user.avatar || user.fullName?.slice(0, 2).toUpperCase() || 'CL'}
            </div>
            <div>
              <p className="text-sm font-display text-textPrimary">{user.fullName}</p>
              <p className="text-xs font-mono text-textTertiary">{user.email}</p>
              <p className="text-xs font-mono text-textTertiary">{user.role}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-textSecondary mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-textSecondary mb-1.5 uppercase tracking-wider">Organization / Club</label>
            <input
              type="text"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="e.g. Mumbai Cricket Academy"
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all font-mono placeholder:text-textTertiary"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-textSecondary mb-1.5 uppercase tracking-wider">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent transition-all font-mono appearance-none cursor-pointer"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={profileSaving}
            className="flex items-center gap-2 bg-accent hover:bg-accentHover text-primary px-5 py-2.5 rounded-xl text-sm font-mono font-bold uppercase tracking-wider transition-all btn-press shadow-glow-amber disabled:opacity-50"
          >
            <Save size={14} />
            {profileSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>

      {/* Password */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-anchor-bg border border-anchor-border flex items-center justify-center text-anchor-text">
            <Lock size={15} />
          </div>
          <h2 className="text-sm font-mono uppercase tracking-wider text-textPrimary font-bold">Change Password</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-textSecondary mb-1.5 uppercase tracking-wider">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all font-mono"
              />
              <button onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textPrimary transition-colors">
                {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-textSecondary mb-1.5 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all font-mono"
              />
              <button onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textPrimary transition-colors">
                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-textSecondary mb-1.5 uppercase tracking-wider">Confirm New Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all font-mono"
            />
          </div>

          {pwError && (
            <div className="flex items-center gap-2 text-xs font-mono text-liability-text">
              <AlertCircle size={12} /> {pwError}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={pwSaving}
            className="flex items-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-5 py-2.5 rounded-xl text-sm font-mono font-bold uppercase tracking-wider transition-all btn-press disabled:opacity-50"
          >
            <Lock size={14} />
            {pwSaving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="glass-card rounded-2xl p-6 border border-liability-border/30 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-liability-bg border border-liability-border flex items-center justify-center text-liability-text">
            <Trash2 size={15} />
          </div>
          <h2 className="text-sm font-mono uppercase tracking-wider text-liability-text font-bold">Danger Zone</h2>
        </div>
        <p className="text-xs text-textSecondary font-mono">Permanently deletes your account and all match data. This action cannot be undone.</p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-liability-bg hover:bg-liability-bg/80 border border-liability-border text-liability-text px-5 py-2.5 rounded-xl text-sm font-mono font-bold uppercase tracking-wider transition-all btn-press"
          >
            <Trash2 size={14} /> Delete Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 bg-liability-text hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-mono font-bold uppercase tracking-wider transition-all btn-press"
            >
              <AlertCircle size={14} /> Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-mono text-textSecondary hover:text-textPrimary transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
