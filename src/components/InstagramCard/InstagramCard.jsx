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

    // 1. Background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, W, H);

    // 2. Inner Frame
    const pad = 60;
    const innerW = W - (pad * 2);
    
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, pad, innerW, H - (pad * 2));

    // 3. Header Label
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#3B82F6';
    ctx.font = '600 22px "DM Sans", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('OFFICIAL MATCH REPORT', pad + 40, pad + 40);
    ctx.letterSpacing = '0px';

    // 4. Teams (With maxWidth to prevent overflow)
    const textMaxWidth = innerW - 80;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 60px "Fraunces", serif';
    ctx.fillText((match.teamName || 'TEAM A').toUpperCase(), pad + 40, pad + 100, textMaxWidth);
    
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 36px "Fraunces", serif';
    ctx.fillText(`vs ${(match.opponent || 'OPPONENT').toUpperCase()}`, pad + 40, pad + 170, textMaxWidth);

    // 5. Result Badge
    const isWon = match.result === 'Won';
    const badgeColor = isWon ? '#10B981' : '#EF4444';
    const badgeText = isWon ? 'VICTORY' : 'DEFEAT';
    
    ctx.fillStyle = badgeColor;
    ctx.fillRect(W - pad - 200, pad + 35, 160, 50);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 22px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, W - pad - 120, pad + 60);

    // Reset alignment
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 6. Meta info bar
    ctx.fillStyle = '#111827';
    ctx.fillRect(pad, pad + 250, innerW, 70);
    
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 22px "JetBrains Mono", monospace';
    const dateStr = match.date ? new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '';
    ctx.textBaseline = 'middle';
    ctx.fillText(`DATE: ${dateStr}   |   FORMAT: ${match.format || 'T20'}`, pad + 40, pad + 285);
    ctx.textBaseline = 'top';

    let currentY = pad + 370;

    // 7. Top Performer Section
    if (topPlayer) {
      ctx.fillStyle = '#3B82F6';
      ctx.font = '600 18px "DM Sans", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('STAR PERFORMER', pad + 40, currentY);
      ctx.letterSpacing = '0px';
      
      // Box
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.fillRect(pad + 40, currentY + 35, innerW - 80, 140);
      ctx.strokeRect(pad + 40, currentY + 35, innerW - 80, 140);

      // Player Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '500 42px "Fraunces", serif';
      ctx.fillText(topPlayer.name ? topPlayer.name.toUpperCase() : 'PLAYER', pad + 70, currentY + 65, innerW - 350);

      // Role
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 22px "DM Sans", sans-serif';
      ctx.fillText(topPlayer.role ? topPlayer.role.toUpperCase() : 'ROLE', pad + 70, currentY + 120, innerW - 350);

      // Key Stat
      if (topPlayer.key_stat) {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#3B82F6';
        ctx.font = '600 48px "JetBrains Mono", monospace';
        ctx.fillText(topPlayer.key_stat, W - pad - 70, currentY + 65, 250);
        
        ctx.fillStyle = '#64748B';
        ctx.font = '600 18px "JetBrains Mono", monospace';
        ctx.fillText(`IMPACT: ${topPlayer.match_impact || 0}/10`, W - pad - 70, currentY + 120);
        ctx.textAlign = 'left';
      }

      currentY += 220;
    }

    // 8. Match Summary Section
    const summary = match.analysis?.team_summary;
    if (summary?.what_won_lost_match) {
      ctx.fillStyle = '#3B82F6';
      ctx.font = '500 18px "Fraunces", serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('TURNING POINT', pad + 40, currentY);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '400 28px "DM Sans", sans-serif';
      wrapText(ctx, summary.what_won_lost_match, pad + 40, currentY + 40, innerW - 80, 42);
    }

    // 9. Footer Branding
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(pad, H - pad - 80, innerW, 80);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 28px "Fraunces", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('COACHLENS', pad + 40, H - pad - 40);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '500 18px "DM Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('AI CRICKET ANALYTICS', W - pad - 40, H - pad - 40);

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
      <div className="relative w-full max-w-lg modal-card border border-border shadow-2xl flex flex-col max-h-[90vh] animate-scale-pop">
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
