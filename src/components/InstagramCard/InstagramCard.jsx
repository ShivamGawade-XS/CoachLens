import React, { useRef, useState, useEffect } from 'react';
import { Download, Instagram, Loader2 } from 'lucide-react';

export default function InstagramCard({ match, onClose }) {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);

  const topPlayer = (match.analysis?.players || []).reduce((best, p) => {
    const impact = parseFloat(p.match_impact || 0);
    return impact > (best?.impact || 0) ? { ...p, impact } : best;
  }, null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0A0C10');
    bg.addColorStop(0.5, '#101420');
    bg.addColorStop(1, '#0A0C10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Accent glow
    const glow = ctx.createRadialGradient(W / 2, 300, 50, W / 2, 300, 500);
    glow.addColorStop(0, 'rgba(232, 160, 32, 0.15)');
    glow.addColorStop(1, 'rgba(232, 160, 32, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Top accent bar
    const bar = ctx.createLinearGradient(0, 0, W, 0);
    bar.addColorStop(0, '#E8A020');
    bar.addColorStop(0.5, '#E8A020');
    bar.addColorStop(1, 'rgba(232, 160, 32, 0)');
    ctx.fillStyle = bar;
    ctx.fillRect(0, 0, W, 4);

    // CoachLens branding
    ctx.fillStyle = 'rgba(232, 160, 32, 0.7)';
    ctx.font = '600 16px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.letterSpacing = '8px';
    ctx.fillText('COACHLENS', 60, 60);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '400 12px "Inter", monospace';
    ctx.fillText('AI CRICKET ANALYTICS', 60, 82);

    // Format badge
    ctx.fillStyle = 'rgba(232, 160, 32, 0.1)';
    roundRect(ctx, W - 140, 40, 80, 30, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232, 160, 32, 0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, W - 140, 40, 80, 30, 8);
    ctx.stroke();
    ctx.fillStyle = '#E8A020';
    ctx.font = 'bold 13px "Inter", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(match.format || 'T20', W - 100, 60);

    // Result badge
    const isWon = match.result === 'Won';
    ctx.textAlign = 'center';
    const resultX = W / 2, resultY = 160;
    ctx.fillStyle = isWon ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)';
    roundRect(ctx, resultX - 60, resultY - 20, 120, 40, 20);
    ctx.fill();
    ctx.strokeStyle = isWon ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1;
    roundRect(ctx, resultX - 60, resultY - 20, 120, 40, 20);
    ctx.stroke();
    ctx.fillStyle = isWon ? '#22C55E' : '#EF4444';
    ctx.font = 'bold 14px "Inter", monospace';
    ctx.fillText(isWon ? '✓ VICTORY' : '✗ DEFEAT', resultX, resultY + 5);

    // Teams
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px "Inter", sans-serif';
    ctx.fillText(match.teamName || 'Team A', W / 2, 250);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillText(`vs ${match.opponent || 'Opponent'}`, W / 2, 285);

    // Divider
    const divGrad = ctx.createLinearGradient(100, 0, W - 100, 0);
    divGrad.addColorStop(0, 'rgba(232, 160, 32, 0)');
    divGrad.addColorStop(0.5, 'rgba(232, 160, 32, 0.5)');
    divGrad.addColorStop(1, 'rgba(232, 160, 32, 0)');
    ctx.fillStyle = divGrad;
    ctx.fillRect(100, 320, W - 200, 1);

    // Team Summary section
    const summary = match.analysis?.team_summary;
    if (summary) {
      ctx.fillStyle = 'rgba(232, 160, 32, 0.6)';
      ctx.font = '600 11px "Inter", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('MATCH TURNING POINT', 80, 370);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '400 16px "Inter", sans-serif';
      wrapText(ctx, summary.what_won_lost_match || '', 80, 398, W - 160, 22);
    }

    // Top Performer Card
    if (topPlayer) {
      const cardY = 480;
      // Card background
      ctx.fillStyle = 'rgba(232, 160, 32, 0.06)';
      roundRect(ctx, 60, cardY, W - 120, 180, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(232, 160, 32, 0.2)';
      ctx.lineWidth = 1;
      roundRect(ctx, 60, cardY, W - 120, 180, 16);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#E8A020';
      ctx.font = '600 11px "Inter", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('★ TOP PERFORMER', 100, cardY + 35);

      // Player name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px "Inter", sans-serif';
      ctx.fillText(topPlayer.name || 'Player', 100, cardY + 75);

      // Role & tag
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '400 14px "Inter", sans-serif';
      ctx.fillText(topPlayer.role || '', 100, cardY + 100);

      // Key stat
      if (topPlayer.key_stat) {
        ctx.fillStyle = '#E8A020';
        ctx.font = 'bold 36px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(topPlayer.key_stat, W - 100, cardY + 75);

        ctx.fillStyle = 'rgba(232, 160, 32, 0.6)';
        ctx.font = '400 13px "Inter", sans-serif';
        ctx.fillText(`Impact: ${topPlayer.match_impact}/10`, W - 100, cardY + 100);
      }

      // What worked
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '400 13px "Inter", sans-serif';
      wrapText(ctx, topPlayer.what_worked || '', 100, cardY + 140, W - 200, 18);
    }

    // Stats boxes
    const coach = match.analysis?.coach_decisions;
    if (coach?.tactical_focus_next_game) {
      const focusY = 700;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      roundRect(ctx, 60, focusY, W - 120, 80, 12);
      ctx.fill();
      ctx.fillStyle = 'rgba(232, 160, 32, 0.6)';
      ctx.font = '600 11px "Inter", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TACTICAL FOCUS', 90, focusY + 30);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '400 14px "Inter", sans-serif';
      wrapText(ctx, coach.tactical_focus_next_game, 90, focusY + 55, W - 180, 18);
    }

    // Date
    const dateStr = match.date ? new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '400 12px "Inter", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(dateStr, W / 2, 840);

    // Bottom branding
    const bottomBar = ctx.createLinearGradient(0, 0, W, 0);
    bottomBar.addColorStop(0, 'rgba(232, 160, 32, 0)');
    bottomBar.addColorStop(0.5, 'rgba(232, 160, 32, 0.3)');
    bottomBar.addColorStop(1, 'rgba(232, 160, 32, 0)');
    ctx.fillStyle = bottomBar;
    ctx.fillRect(0, H - 100, W, 1);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '400 11px "Inter", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POWERED BY COACHLENS • AI CRICKET ANALYTICS', W / 2, H - 60);

    ctx.fillStyle = 'rgba(232, 160, 32, 0.4)';
    ctx.font = '400 12px "Inter", monospace';
    ctx.fillText('@coachlens', W / 2, H - 35);

    // Bottom accent bar
    ctx.fillStyle = '#E8A020';
    ctx.fillRect(0, H - 4, W, 4);

    setIsRendering(false);
  }, [match]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `CoachLens-${(match.teamName || 'Match').replace(/\s+/g, '-')}-Card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-pop">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface2/50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white">
              <Instagram size={20} />
            </div>
            <div>
              <h2 className="text-lg font-display text-textPrimary">Instagram Match Card</h2>
              <p className="text-xs text-textTertiary font-mono tracking-wider">1080×1080 • SHAREABLE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-textTertiary hover:text-textPrimary hover:bg-surface3 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-primary/50">
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          )}
          <canvas ref={canvasRef} className="max-w-full rounded-xl shadow-2xl border border-border/30" style={{ maxHeight: '60vh', width: 'auto' }} />
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-border bg-surface2/50 rounded-b-2xl flex items-center justify-end gap-3 shrink-0">
          <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white shadow-lg btn-press">
            <Download size={16} /> Download for Instagram
          </button>
        </div>
      </div>
    </div>
  );
}

// Helpers
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
      line = words[i] + ' ';
      lineCount++;
      if (lineCount >= 3) { ctx.fillText(line.trim() + '...', x, y + lineCount * lineHeight); return; }
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
}
