import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center relative overflow-hidden">
      <div className="ambient-gradient" />
      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-surface2 border border-border flex items-center justify-center mx-auto mb-8 text-4xl">
          🏏
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-textTertiary mb-3">Error 404</p>
        <h1 className="text-4xl md:text-5xl font-display text-textPrimary mb-4">Page Not Found</h1>
        <p className="text-textSecondary text-sm leading-relaxed mb-10">
          This page went for a duck. It doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-surface2 border border-border text-textPrimary font-mono font-bold text-sm uppercase tracking-wider hover:bg-surface3 transition-all"
          >
            ← Go Back
          </button>
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accentHover text-white font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-glow-accent text-center"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
