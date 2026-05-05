import React from 'react';
import { Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const tagConfig = {
  Aggressor: { bg: "bg-aggressor-bg", text: "text-aggressor-text", border: "border-aggressor-border" },
  Anchor:    { bg: "bg-anchor-bg", text: "text-anchor-text", border: "border-anchor-border" },
  Improving: { bg: "bg-improving-bg", text: "text-improving-text", border: "border-improving-border" },
  Liability: { bg: "bg-liability-bg", text: "text-liability-text", border: "border-liability-border" }
};

export default function PlayerCard({ player }) {
  const config = tagConfig[player.tag] || tagConfig.Anchor;
  const cardId = `player-card-${player.name.replace(/\s+/g, '-')}`;

  const handleShare = async () => {
    const element = document.getElementById(cardId);
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0D0F12',
        scale: 2,
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `CoachLens-${player.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  // Function to highlight numbers in text
  const highlightNumbers = (text) => {
    return text.split(/(\d+(?:\.\d+)?%?)/g).map((part, i) => {
      if (/\d/.test(part)) {
        return <span key={i} className="text-accent font-semibold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div id={cardId} className={`relative bg-surface1 border-l-[3px] rounded-lg p-5 flex flex-col ${config.border} border-y border-r border-y-border border-r-border`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-display text-xl">{player.name}</h3>
          <p className="text-xs text-textSecondary mt-1">{player.role}</p>
        </div>
        <div className={`${config.bg} ${config.text} border ${config.border} px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider`}>
          {player.tag}
        </div>
      </div>
      
      <div className="h-px bg-border my-4 w-full" />

      <div className="space-y-4 flex-1">
        <div>
          <h4 className="text-[10px] text-textSecondary uppercase tracking-[0.2em] mb-1">✓ What Worked</h4>
          <p className="text-sm">{highlightNumbers(player.what_worked)}</p>
        </div>
        
        <div>
          <h4 className="text-[10px] text-textSecondary uppercase tracking-[0.2em] mb-1">✗ What Failed</h4>
          <p className="text-sm">{highlightNumbers(player.what_failed)}</p>
        </div>
        
        <div>
          <h4 className="text-[10px] text-textSecondary uppercase tracking-[0.2em] mb-1">→ Next Match</h4>
          <p className="text-sm">{highlightNumbers(player.next_match_instruction)}</p>
        </div>
        
        <div>
          <h4 className="text-[10px] text-textSecondary uppercase tracking-[0.2em] mb-1">◉ Drill</h4>
          <p className="text-sm">{highlightNumbers(player.practice_drill)}</p>
        </div>
      </div>

      <button 
        onClick={handleShare}
        className="self-end mt-4 text-xs text-textSecondary hover:text-textPrimary flex items-center transition-colors"
        title="Download Card as Image"
        data-html2canvas-ignore="true"
      >
        <Share2 size={12} className="mr-1" /> Share Card
      </button>
    </div>
  );
}
