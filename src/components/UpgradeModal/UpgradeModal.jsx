import React from 'react';
import { X, Zap } from 'lucide-react';

export default function UpgradeModal({ onClose, onGetPlan }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative modal-card rounded-2xl border border-border p-8 max-w-md w-full shadow-2xl animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent rounded-t-2xl" />

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Zap size={18} className="text-accent" />
            </div>
            <div>
              <h2 id="upgrade-modal-title" className="font-display text-lg text-textPrimary">Free limit reached</h2>
              <p className="text-[11px] text-textTertiary font-mono uppercase tracking-wider mt-0.5">3 of 3 analyses used</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary transition-colors p-1 rounded-lg hover:bg-surface2"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-textSecondary leading-relaxed mb-2">
          You've used all 3 free analyses. Upgrade to continue analyzing matches and unlock the <span className="text-accent font-semibold">Coach Brief</span> — batting order changes, bowling rotations, and tactical focus.
        </p>

        <div className="bg-surface2/60 border border-border rounded-xl p-4 mb-6 mt-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-2xl text-textPrimary font-bold">₹99</span>
            <span className="text-textTertiary text-xs font-mono">/month · Team Plan</span>
          </div>
          <ul className="space-y-1.5 mt-3">
            {['Unlimited analyses', 'Full Coach Brief unlocked', 'Priority AI responses', 'PDF export'].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs text-textSecondary">
                <span className="text-aggressor-text text-[10px]">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            id="upgrade-get-plan-btn"
            onClick={onGetPlan}
            className="flex-1 bg-accent hover:bg-accentHover text-primary font-mono text-sm font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors"
          >
            Get Team Plan
          </button>
          <button
            id="upgrade-continue-free-btn"
            onClick={onClose}
            className="flex-1 bg-surface2 hover:bg-surface3 border border-border text-textSecondary hover:text-textPrimary font-mono text-sm uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors"
          >
            Continue free
          </button>
        </div>

        <p className="text-center text-[10px] text-textTertiary font-mono mt-4">
          Have a promo code? Go to <span className="text-accent">Settings → Upgrade</span>
        </p>
      </div>
    </div>
  );
}
