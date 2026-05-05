import React from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function CoachBrief({ brief }) {
  if (!brief) return null;

  const handleExportPDF = async () => {
    const element = document.getElementById('coach-brief-content');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#0D0F12', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('CoachLens-Decision-Brief.pdf');
    } catch (err) {
      console.error('Failed to export PDF', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2">
      <div 
        id="coach-brief-content"
        className="bg-primary border-l-[4px] border-accent p-8 relative rounded-r-lg"
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h2 className="font-mono uppercase tracking-widest text-sm font-bold text-textPrimary">Pre-Match Decision Brief</h2>
          <button 
            onClick={handleExportPDF}
            className="flex items-center text-xs text-textSecondary hover:text-accent transition-colors"
            data-html2canvas-ignore="true"
          >
            Export PDF <Download size={14} className="ml-1" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="text-textSecondary font-mono font-bold w-6">01</div>
            <div>
              <h3 className="text-[11px] text-textSecondary uppercase tracking-[0.2em] mb-2">Batting Order</h3>
              <p className="text-base text-textPrimary leading-relaxed">
                {brief.batting_order_change}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-textSecondary font-mono font-bold w-6">02</div>
            <div>
              <h3 className="text-[11px] text-textSecondary uppercase tracking-[0.2em] mb-2">Bowling Rotation</h3>
              <p className="text-base text-textPrimary leading-relaxed">
                {brief.bowling_rotation}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-textSecondary font-mono font-bold w-6">03</div>
            <div>
              <h3 className="text-[11px] text-textSecondary uppercase tracking-[0.2em] mb-2">Player On Notice</h3>
              <p className="text-base text-textPrimary leading-relaxed">
                {brief.player_on_notice}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-textSecondary font-mono font-bold w-6">04</div>
            <div>
              <h3 className="text-[11px] text-accent uppercase tracking-[0.2em] mb-2">Tactical Focus</h3>
              <p className="text-base text-textPrimary leading-relaxed font-medium">
                {brief.tactical_focus_next_game}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
