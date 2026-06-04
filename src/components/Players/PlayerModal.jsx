import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import AvatarInitials from './AvatarInitials';

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
const BATTING_STYLES = ['Right Hand', 'Left Hand'];
const BOWLING_STYLES = [
  'Right Arm Fast', 'Right Arm Medium', 'Right Arm Off-Spin', 'Right Arm Leg-Spin',
  'Left Arm Fast', 'Left Arm Medium', 'Left Arm Orthodox', 'Left Arm Wrist-Spin',
  'Does Not Bowl',
];

const ROLE_COLORS = {
  'Batsman':        'bg-anchor-bg text-anchor-text border-anchor-border',
  'Bowler':         'bg-aggressor-bg text-aggressor-text border-aggressor-border',
  'All-Rounder':    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/40',
  'Wicket-Keeper':  'bg-improving-bg text-improving-text border-improving-border',
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export default function PlayerModal({ player = null, onSave, onClose }) {
  const isEdit = !!player;
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    jerseyNumber: '',
    role: 'Batsman',
    battingStyle: 'Right Hand',
    bowlingStyle: 'Does Not Bowl',
    age: '',
    phone: '',
    notes: '',
    profilePicture: null,
  });

  const [nameError, setNameError] = useState('');
  const [imageError, setImageError] = useState('');

  // Pre-fill form on edit
  useEffect(() => {
    if (player) {
      setForm({
        name: player.name || '',
        jerseyNumber: player.jerseyNumber != null ? String(player.jerseyNumber) : '',
        role: player.role || 'Batsman',
        battingStyle: player.battingStyle || 'Right Hand',
        bowlingStyle: player.bowlingStyle || 'Does Not Bowl',
        age: player.age != null ? String(player.age) : '',
        phone: player.phone || '',
        notes: player.notes || '',
        profilePicture: player.profilePicture || null,
      });
    }
  }, [player]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Close on outside click
  const handleBackdropClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'name') setNameError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      handleChange('profilePicture', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setNameError('Player name is required.');
      return;
    }

    const playerData = {
      ...(isEdit ? { id: player.id } : {}),
      name: trimmedName,
      jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber, 10) : null,
      role: form.role,
      battingStyle: form.battingStyle,
      bowlingStyle: form.bowlingStyle,
      age: form.age ? parseInt(form.age, 10) : null,
      phone: form.phone.trim(),
      notes: form.notes.trim(),
      profilePicture: form.profilePicture,
    };

    onSave(playerData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto modal-card rounded-2xl border border-border shadow-2xl animate-scale-pop"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border rounded-t-2xl" style={{background: 'inherit'}}>
          <h2 className="text-lg font-display text-textPrimary">
            {isEdit ? 'Edit Player' : 'Add Player'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textSecondary hover:text-textPrimary transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">

          {/* 1. Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {form.profilePicture ? (
                <img
                  src={form.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border group-hover:border-accent transition-colors"
                />
              ) : (
                <AvatarInitials name={form.name || 'New'} size="w-24 h-24" textSize="text-2xl" />
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-[10px] text-textTertiary font-mono">Click to upload • JPG, PNG, WebP • Max 2MB</p>
            {imageError && (
              <p className="text-xs text-liability-text font-mono flex items-center gap-1">
                <AlertCircle size={12} /> {imageError}
              </p>
            )}
          </div>

          {/* 2. Player Name */}
          <div>
            <label className="block text-[10px] text-textSecondary uppercase font-mono tracking-widest mb-1.5">
              Player Name <span className="text-liability-text">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Virat Sharma"
              className={`w-full bg-surface2 border ${nameError ? 'border-liability-border' : 'border-border'} rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-colors font-mono`}
            />
            {nameError && (
              <p className="mt-1 text-xs text-liability-text font-mono flex items-center gap-1">
                <AlertCircle size={12} /> {nameError}
              </p>
            )}
          </div>

          {/* 3. Jersey Number */}
          <div>
            <label className="block text-[10px] text-textSecondary uppercase font-mono tracking-widest mb-1.5">
              Jersey Number
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={form.jerseyNumber}
              onChange={(e) => handleChange('jerseyNumber', e.target.value)}
              placeholder="1–99"
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-colors font-mono"
            />
          </div>

          {/* 4. Role — Pill Selector */}
          <div>
            <label className="block text-[10px] text-textSecondary uppercase font-mono tracking-widest mb-2">
              Role
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleChange('role', r)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all btn-press ${
                    form.role === r
                      ? ROLE_COLORS[r]
                      : 'bg-surface2 text-textTertiary border-border hover:border-borderHover hover:text-textSecondary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Batting Style — 2-pill selector */}
          <div>
            <label className="block text-[10px] text-textSecondary uppercase font-mono tracking-widest mb-2">
              Batting Style
            </label>
            <div className="flex gap-2">
              {BATTING_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleChange('battingStyle', s)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all btn-press ${
                    form.battingStyle === s
                      ? 'bg-accent/15 text-accent border-accent/30'
                      : 'bg-surface2 text-textTertiary border-border hover:border-borderHover hover:text-textSecondary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Bowling Style — Dropdown */}
          <div>
            <label className="block text-[10px] text-textSecondary uppercase font-mono tracking-widest mb-1.5">
              Bowling Style
            </label>
            <select
              value={form.bowlingStyle}
              onChange={(e) => handleChange('bowlingStyle', e.target.value)}
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors font-mono appearance-none cursor-pointer"
            >
              {BOWLING_STYLES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 7. Age */}
          <div>
            <label className="block text-[10px] text-textSecondary uppercase font-mono tracking-widest mb-1.5">
              Age
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="Optional"
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-colors font-mono"
            />
          </div>

          {/* 8. Phone */}
          <div>
            <label className="block text-[10px] text-textSecondary uppercase font-mono tracking-widest mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Optional — for coach use only"
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-colors font-mono"
            />
          </div>

          {/* 9. Coach Notes */}
          <div>
            <label className="block text-[10px] text-textSecondary uppercase font-mono tracking-widest mb-1.5">
              Coach Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Private notes visible only to you"
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-colors font-mono resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center gap-3 p-5 border-t border-border rounded-b-2xl" style={{background: 'inherit'}}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-surface2 border border-border text-textSecondary font-mono text-sm font-bold uppercase tracking-wider hover:bg-surface3 transition-colors btn-press"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-xl bg-accent hover:bg-accentHover text-white font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-glow-accent btn-press"
          >
            {isEdit ? 'Update Player' : 'Save Player'}
          </button>
        </div>
      </div>
    </div>
  );
}
