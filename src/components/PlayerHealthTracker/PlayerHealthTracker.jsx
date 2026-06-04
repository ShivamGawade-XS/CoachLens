import React, { useState } from 'react';
import { Heart, HeartPulse, AlertTriangle, ShieldCheck, BedDouble, X, Check, ChevronDown } from 'lucide-react';

export const HEALTH_STATUSES = [
  { key: 'fit', label: 'Fit', emoji: '💚', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/25', dotColor: 'bg-emerald-400' },
  { key: 'niggle', label: 'Minor Niggle', emoji: '💛', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/25', dotColor: 'bg-yellow-400' },
  { key: 'injured', label: 'Injured', emoji: '❤️‍🩹', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/25', dotColor: 'bg-red-400' },
  { key: 'recovering', label: 'Recovering', emoji: '🩵', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/25', dotColor: 'bg-blue-400' },
  { key: 'rested', label: 'Rested', emoji: '😴', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/25', dotColor: 'bg-purple-400' },
];

export function getHealthStatus(key) {
  return HEALTH_STATUSES.find(s => s.key === key) || HEALTH_STATUSES[0];
}

/** Small inline health dot indicator for roster table */
export function HealthDot({ status }) {
  const s = getHealthStatus(status);
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${s.dotColor} shrink-0`}
      title={s.label}
    />
  );
}

/** Compact health badge for roster table rows */
export function HealthBadge({ status }) {
  const s = getHealthStatus(status);
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border whitespace-nowrap ${s.color} ${s.bg} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />
      {s.label}
    </span>
  );
}

/** Health status picker dropdown for edit modals */
export function HealthPicker({ value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest flex items-center gap-1">
        <HeartPulse size={9} /> Health Status
      </label>
      <select
        value={value || 'fit'}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
      >
        {HEALTH_STATUSES.map(s => (
          <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
        ))}
      </select>
    </div>
  );
}

/** Full health overview panel showing team fitness status */
export default function PlayerHealthTracker({ roster, onUpdateHealth }) {
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('fit');
  const [injuryNote, setInjuryNote] = useState('');

  const healthCounts = HEALTH_STATUSES.map(s => ({
    ...s,
    count: roster.filter(p => (p.healthStatus || 'fit') === s.key).length,
  }));

  const fitCount = healthCounts.find(h => h.key === 'fit')?.count || 0;
  const totalCount = roster.length;
  const fitnessPercent = totalCount > 0 ? Math.round((fitCount / totalCount) * 100) : 0;

  const unavailable = roster.filter(p => p.healthStatus === 'injured' || p.healthStatus === 'recovering');

  const handleSave = () => {
    if (!editingPlayer) return;
    onUpdateHealth(editingPlayer.name, selectedStatus, injuryNote);
    setEditingPlayer(null);
    setInjuryNote('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display text-textPrimary flex items-center gap-2">
          <HeartPulse size={18} className="text-accent" /> Squad Fitness
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold ${fitnessPercent >= 80 ? 'text-emerald-400' : fitnessPercent >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {fitnessPercent}% Available
          </span>
        </div>
      </div>

      {/* Health Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {healthCounts.map(h => (
          <div
            key={h.key}
            className={`${h.bg} ${h.border} border rounded-xl p-3 text-center transition-all duration-200 ${h.count > 0 ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className="text-lg mb-0.5">{h.emoji}</div>
            <div className={`text-xl font-display ${h.color}`}>{h.count}</div>
            <div className="text-[9px] font-mono text-textTertiary uppercase tracking-widest">{h.label}</div>
          </div>
        ))}
      </div>

      {/* Fitness Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-textTertiary uppercase tracking-widest">Squad Availability</span>
          <span className="text-xs font-mono text-textSecondary">{fitCount}/{totalCount} fit</span>
        </div>
        <div className="h-3 bg-surface3 rounded-full overflow-hidden flex">
          {healthCounts.filter(h => h.count > 0).map(h => (
            <div
              key={h.key}
              className={`h-full ${h.dotColor} transition-all duration-500`}
              style={{ width: `${(h.count / Math.max(totalCount, 1)) * 100}%` }}
              title={`${h.label}: ${h.count}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {healthCounts.filter(h => h.count > 0).map(h => (
            <div key={h.key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${h.dotColor}`} />
              <span className="text-[9px] font-mono text-textTertiary">{h.label} ({h.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unavailable Players Alert */}
      {unavailable.length > 0 && (
        <div className="bg-red-400/[0.05] border border-red-400/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
              Unavailable ({unavailable.length})
            </span>
          </div>
          <div className="space-y-2">
            {unavailable.map(p => {
              const s = getHealthStatus(p.healthStatus);
              return (
                <div key={p.name} className="flex items-center justify-between p-2 bg-surface2/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                    <span className="text-sm text-textPrimary font-medium">{p.name}</span>
                    <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${s.color} ${s.bg} ${s.border}`}>
                      {s.label}
                    </span>
                  </div>
                  {p.injuryNote && (
                    <span className="text-[10px] font-mono text-textTertiary hidden sm:block">{p.injuryNote}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Player Health List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="bg-surface2/50 px-5 py-3 border-b border-border">
          <span className="text-[10px] font-mono text-textTertiary uppercase tracking-widest">Update Player Health</span>
        </div>
        <div className="divide-y divide-border/50">
          {roster.map(player => {
            const s = getHealthStatus(player.healthStatus);
            return (
              <div
                key={player.name}
                className="flex items-center justify-between px-5 py-3 hover:bg-surface2/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dotColor} shrink-0`} />
                  <div className="min-w-0">
                    <span className="text-sm text-textPrimary font-medium truncate block">{player.name}</span>
                    {player.injuryNote && (
                      <span className="text-[10px] font-mono text-textTertiary block truncate">{player.injuryNote}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingPlayer(player);
                    setSelectedStatus(player.healthStatus || 'fit');
                    setInjuryNote(player.injuryNote || '');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border transition-all hover:opacity-80 ${s.color} ${s.bg} ${s.border}`}
                >
                  {s.emoji} {s.label}
                  <ChevronDown size={10} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Health Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setEditingPlayer(null)} />
          <div className="relative modal-card rounded-2xl p-6 w-full max-w-sm border border-border animate-scale-pop">
            <button onClick={() => setEditingPlayer(null)} className="absolute top-4 right-4 p-2 text-textTertiary hover:text-textPrimary">
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <HeartPulse size={20} className="text-accent" />
              <div>
                <h3 className="text-base font-display text-textPrimary">{editingPlayer.name}</h3>
                <p className="text-[10px] font-mono text-textTertiary">{editingPlayer.role}</p>
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Status</label>
              <div className="grid grid-cols-1 gap-2">
                {HEALTH_STATUSES.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedStatus(s.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedStatus === s.key
                        ? `${s.bg} ${s.border} ${s.color} shadow-sm`
                        : 'bg-surface2 border-border text-textSecondary hover:border-borderHover'
                    }`}
                  >
                    <span className="text-base">{s.emoji}</span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider flex-1">{s.label}</span>
                    {selectedStatus === s.key && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Injury Note */}
            {(selectedStatus === 'injured' || selectedStatus === 'niggle' || selectedStatus === 'recovering') && (
              <div className="space-y-1.5 mb-4">
                <label className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Injury Note (optional)</label>
                <input
                  type="text"
                  value={injuryNote}
                  onChange={e => setInjuryNote(e.target.value)}
                  placeholder="e.g. Hamstring strain, 2 weeks out"
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-accent hover:bg-accentHover text-white py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
            >
              Update Health Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
