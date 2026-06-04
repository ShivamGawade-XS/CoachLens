import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * @param {{ onClose: () => void, onRedeem: (code: string) => boolean }} props
 */
export default function PromoModal({ onClose, onRedeem }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'loading' | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const ok = await onRedeem(code);
    setStatus(ok ? 'success' : 'error');
    if (ok) setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative modal-card rounded-2xl border border-border p-8 max-w-sm w-full shadow-2xl animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-modal-title"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent rounded-t-2xl" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Key size={16} className="text-accent" />
            </div>
            <h2 id="promo-modal-title" className="font-display text-base text-textPrimary">Redeem Promo Code</h2>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary transition-colors p-1 rounded-lg hover:bg-surface2" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="promo-code-input" className="block text-[11px] font-mono uppercase tracking-wider text-textTertiary mb-2">
              Enter code
            </label>
            <input
              id="promo-code-input"
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value); setStatus(null); }}
              placeholder="e.g. COACH2026"
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 font-mono text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-colors uppercase tracking-wider"
              autoFocus
              autoComplete="off"
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-aggressor-text text-sm">
              <CheckCircle size={15} /> Plan unlocked — welcome to Team Plan!
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-liability-text text-sm">
              <AlertCircle size={15} /> Invalid code. Try again.
            </div>
          )}

          <button
            id="promo-redeem-btn"
            type="submit"
            disabled={!code.trim() || status === 'success' || status === 'loading'}
            className="w-full bg-accent hover:bg-accentHover text-primary font-mono text-sm font-bold uppercase tracking-wider py-2.5 rounded-xl transition-colors disabled:opacity-40"
          >
            {status === 'loading' ? 'Verifying...' : 'Redeem'}
          </button>
        </form>
      </div>
    </div>
  );
}
