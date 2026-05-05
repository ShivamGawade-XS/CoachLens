import React from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const decisions = [
  { num: '01', key: 'batting_order_change', label: 'Batting Order', icon: '🏏' },
  { num: '02', key: 'bowling_rotation', label: 'Bowling Rotation', icon: '🎯' },
  { num: '03', key: 'player_on_notice', label: 'Player On Notice', icon: '⚠️' },
  { num: '04', key: 'tactical_focus_next_game', label: 'Tactical Focus', icon: '🎯', isHighlight: true },
];

export default function CoachBrief({ brief }) {
  if (!brief) return null;

  const handleExportPDF = async () => {
    const element = document.getElementById('coach-brief-content');
    if (!element) return;
    try {
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
        return <span key={i} className="text-accent font-semibold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-2">
      <div 
        id="coach-brief-content"
        className="glass-card rounded-xl border-l-[4px] border-l-accent relative overflow-hidden"
      >
        {/* Top accent rule */}
        <div className="h-[2px] bg-gradient-to-r from-accent via-accent/40 to-transparent" />

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-border">
          <div>
            <h2 className="font-mono uppercase tracking-[0.2em] text-sm font-bold text-textPrimary">
              Pre-Match Decision Brief
            </h2>
            <p className="text-[10px] text-textTertiary mt-1 font-mono uppercase tracking-wider">
              CoachLens Intelligence Report
            </p>
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 text-xs text-textSecondary hover:text-accent transition-colors bg-surface2 hover:bg-surface3 px-3 py-1.5 rounded-lg border border-border"
            data-html2canvas-ignore="true"
          >
            Export PDF <Download size={13} />
          </button>
        </div>

        {/* Decisions */}
        <div className="px-8 py-6 space-y-8">
          {decisions.map((decision, index) => (
            <div 
              key={decision.key} 
              className="flex gap-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 120}ms`, opacity: 0 }}
            >
              <div className="flex-shrink-0">
                <span className="text-2xl font-mono font-bold text-accent/30">{decision.num}</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-[11px] uppercase tracking-[0.2em] mb-2 font-medium flex items-center gap-1.5 ${
                  decision.isHighlight ? 'text-accent' : 'text-textSecondary'
                }`}>
                  {decision.label}
                </h3>
                <p className={`text-base leading-relaxed ${
                  decision.isHighlight ? 'text-textPrimary font-medium' : 'text-textPrimary/90'
                }`}>
                  {highlightNumbers(brief[decision.key])}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent rule */}
        <div className="h-[2px] bg-gradient-to-r from-accent via-accent/40 to-transparent" />
        
        {/* Footer */}
        <div className="px-8 py-3 flex justify-between items-center">
          <span className="text-[9px] text-textTertiary font-mono uppercase tracking-widest">CoachLens v1.0</span>
          <span className="text-[9px] text-textTertiary font-mono">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
