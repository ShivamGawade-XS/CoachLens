import React, { useContext } from 'react';
import { Download, AlertTriangle, Lock, Zap } from 'lucide-react';
import TossAdvisor from './TossAdvisor';
import PlanContext from '../../contexts/PlanContext';

const decisions = [
  { num: '01', key: 'batting_order_change', label: 'Batting Order', icon: '🏏' },
  { num: '02', key: 'bowling_rotation', label: 'Bowling Rotation', icon: '🎯' },
  { num: '03', key: 'player_on_notice', label: 'Player On Notice', icon: '⚠️' },
  { num: '04', key: 'tactical_focus_next_game', label: 'Tactical Focus', icon: '🎯', isHighlight: true },
];

export default function CoachBrief({ match, brief, flaggedMismatches = [] }) {
  const plan = useContext(PlanContext);
  const isPaid = plan?.isPaid ?? false;

  if (!brief) return null;

  const handleExportPDF = async () => {
    const element = document.getElementById('coach-brief-content');
    if (!element) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const isDark = document.documentElement.classList.contains('dark');
      const canvas = await html2canvas(element, { backgroundColor: isDark ? '#0A0C10' : '#F8FAFC', scale: 2 });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('CoachLens-Decision-Brief.pdf');
    } catch (err) {
      console.error('Failed to export PDF', err);
    }
  };

  const highlightNumbers = (text) => {
    if (!text) return text;
    return text.split(/(\d+(?:\.\d+)?%?)/g).map((part, i) => {
      if (/\d/.test(part)) {
        return <span key={i} className="text-accent font-semibold font-mono">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-2">
      <TossAdvisor match={match} />

      <div
        id="coach-brief-content"
        className="glass-card rounded-xl border-l-[4px] border-l-accent relative overflow-hidden"
      >
        {/* Top accent rule */}
        <div className="h-[2px] bg-gradient-to-r from-accent via-accent/40 to-transparent" />

        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-5 border-b border-border">
          <div>
            <h2 className="font-mono uppercase tracking-[0.2em] text-sm font-bold text-textPrimary">
              Pre-Match Decision Brief
            </h2>
            <p className="text-[10px] text-textTertiary mt-1 font-mono uppercase tracking-wider">
              CoachLens Intelligence Report
            </p>
          </div>
          {isPaid && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 text-xs text-textSecondary hover:text-accent transition-colors bg-surface2 hover:bg-surface3 px-3 py-1.5 rounded-lg border border-border"
              data-html2canvas-ignore="true"
            >
              Export PDF <Download size={13} />
            </button>
          )}
        </div>

        {/* Client-Side Flagged Issues */}
        {flaggedMismatches.length > 0 && (
          <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-border bg-liability-bg/5">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-medium text-liability-text mb-4 flex items-center gap-2">
              <AlertTriangle size={14} /> Tactical Mismatches Flagged
            </h3>
            <div className="space-y-3">
              {flaggedMismatches.map((mismatch, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-surface2/50 border border-liability-border/30 p-3 rounded-lg">
                  <div className="shrink-0 pt-0.5">
                    <span className="text-[10px] uppercase font-bold text-liability-text tracking-wider">{mismatch.playerName}</span>
                  </div>
                  <p className="text-sm text-textPrimary/90 leading-relaxed m-0 flex-1">{mismatch.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Decisions — blurred for free users */}
        <div className="relative">
          <div className={`px-4 sm:px-8 py-5 sm:py-6 space-y-8 ${!isPaid ? 'select-none' : ''}`}>
            {decisions.map((decision, index) => (
              <div
                key={decision.key}
                className={`flex gap-5 animate-fade-in-up ${!isPaid ? 'blur-[6px] pointer-events-none' : ''}`}
                style={{ animationDelay: `${index * 120}ms`, opacity: isPaid ? 0 : 1 }}
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl font-mono font-bold text-accent/30">{decision.num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-[11px] uppercase tracking-[0.2em] mb-2 font-medium flex items-center gap-1.5 ${
                    decision.isHighlight ? 'text-accent' : 'text-textSecondary'
                  }`}>
                    {decision.label}
                  </h3>
                  <p className={`text-base leading-relaxed break-words ${
                    decision.isHighlight ? 'text-textPrimary font-medium' : 'text-textPrimary/90'
                  }`}>
                    {isPaid ? highlightNumbers(brief[decision.key]) : brief[decision.key]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Paywall overlay — free users only */}
          {!isPaid && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="bg-surface1/80 backdrop-blur-md border border-border rounded-2xl px-8 py-7 flex flex-col items-center gap-4 shadow-2xl max-w-xs w-full mx-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Lock size={20} className="text-accent" />
                </div>
                <div className="text-center">
                  <p className="font-display text-base text-textPrimary mb-1">Coach Brief is locked</p>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Batting order changes, bowling rotations &amp; tactical focus — available on Team Plan.
                  </p>
                </div>
                <button
                  id="coach-brief-upgrade-btn"
                  onClick={() => plan?.openUpgradeModal?.()}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-primary font-mono text-sm font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors"
                >
                  <Zap size={14} /> Upgrade to unlock
                </button>
                <button
                  id="coach-brief-promo-btn"
                  onClick={() => plan?.openPromoModal?.()}
                  className="text-[11px] text-textTertiary hover:text-accent font-mono transition-colors underline underline-offset-2"
                >
                  Have a promo code?
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom accent rule */}
        <div className="h-[2px] bg-gradient-to-r from-accent via-accent/40 to-transparent" />

        {/* Footer */}
        <div className="px-4 sm:px-8 py-3 flex justify-between items-center">
          <span className="text-[9px] text-textTertiary font-mono uppercase tracking-widest">CoachLens v1.0</span>
          <span className="text-[9px] text-textTertiary font-mono">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
