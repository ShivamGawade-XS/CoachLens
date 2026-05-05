import React from 'react';
import { Trophy, Users, Shield, ArrowRight } from 'lucide-react';

export default function Teams() {
  const teams = [
    { name: 'Panaji Panthers', players: 14, matches: 8, lastMatch: '2 days ago' },
    { name: 'Margao Strikers', players: 12, matches: 5, lastMatch: '1 week ago' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-display-xl font-display text-textPrimary mb-2">My Teams</h1>
        <p className="text-textSecondary text-sm">Manage your rosters and view team-wide performance trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 group cursor-pointer hover:border-accent/30 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-lg font-display text-textPrimary">{team.name}</h3>
                <p className="text-xs text-textTertiary font-mono">Last active {team.lastMatch}</p>
              </div>
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

            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface2 hover:bg-surface3 text-textPrimary text-xs font-mono font-bold uppercase tracking-wider transition-all">
              View Roster <ArrowRight size={14} />
            </button>
          </div>
        ))}

        <button className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-textTertiary hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all group">
          <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy size={20} />
          </div>
          <span className="text-sm font-mono font-medium">Add New Team</span>
        </button>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-display-xl font-display text-textPrimary mb-2">Settings</h1>
        <p className="text-textSecondary text-sm">Configure your coaching profile and application preferences.</p>
      </div>

      <div className="glass-card rounded-2xl divide-y divide-border overflow-hidden">
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-textTertiary flex items-center gap-2">
            <Users size={12} /> Profile Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-textSecondary uppercase font-mono">Coach Name</label>
              <input type="text" defaultValue="Coach Shivam" className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-textSecondary uppercase font-mono">Organization</label>
              <input type="text" defaultValue="AITG Cricket Academy" className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-textTertiary flex items-center gap-2">
            <Shield size={12} /> Account & Security
          </h3>
          <div className="flex items-center justify-between p-4 bg-surface2 rounded-xl border border-border">
            <div>
              <div className="text-sm font-medium text-textPrimary">Pro Subscription</div>
              <div className="text-[10px] text-textTertiary uppercase font-mono">Next billing: June 12, 2026</div>
            </div>
            <button className="text-xs text-accent font-bold font-mono hover:text-accentHover">Manage</button>
          </div>
        </div>

        <div className="p-6">
          <button className="w-full bg-accent hover:bg-accentHover text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
