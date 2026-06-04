import React, { useState, useEffect } from 'react';
import { X, FileText, Copy, Check, Loader2, Send, Download } from 'lucide-react';
import { groqService } from '../../services/groqService';


// Simple markdown formatter since we don't have react-markdown installed
const formatMarkdown = (text) => {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-md font-bold text-textPrimary mt-4 mb-2">{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-lg font-bold text-accent mt-5 mb-3 uppercase tracking-wider font-display">{line.replace('## ', '')}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-xl font-bold text-textPrimary mt-6 mb-4">{line.replace('# ', '')}</h1>;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const formattedText = formatBold(line.substring(2));
      return <li key={i} className="ml-4 mb-1 text-textSecondary text-sm list-disc">{formattedText}</li>;
    }
    if (line.match(/^\d+\.\s/)) {
      const formattedText = formatBold(line.replace(/^\d+\.\s/, ''));
      return <li key={i} className="ml-4 mb-1 text-textSecondary text-sm list-decimal">{formattedText}</li>;
    }
    if (line.trim() === '') {
      return <br key={i} />;
    }
    return <p key={i} className="text-sm text-textSecondary mb-2 leading-relaxed">{formatBold(line)}</p>;
  });
};

const formatBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-textPrimary font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function FormalReportModal({ match, onClose }) {
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('formal-report-content');
    if (!element) return;
    
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const isDark = document.documentElement.classList.contains('dark');
      const canvas = await html2canvas(element, {
        backgroundColor: isDark ? '#12141A' : '#FFFFFF',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Formal-Report-${match.teamName.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const generate = async () => {
      try {
        const generatedText = await groqService.generateFormalReport(match);
        if (isMounted) {
          setReport(generatedText);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Report generation failed:", err);
        if (isMounted) {
          setError(`Report Error: ${err.message || 'Unknown API failure'}`);
          setIsLoading(false);
        }
      }
    };

    generate();

    return () => { isMounted = false; };
  }, [match]);

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-pop">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface2/50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-display text-textPrimary">Formal Match Report</h2>
              <p className="text-xs text-textTertiary font-mono tracking-wider">AI GENERATED • {match.teamName.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-textTertiary hover:text-textPrimary hover:bg-surface3 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText size={20} className="text-accent animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-display text-textPrimary mb-2">Drafting Official Report...</h3>
              <p className="text-sm text-textTertiary font-mono max-w-xs mx-auto">Analyzing scorecard, identifying top performers, and formatting document structure.</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-liability-text">{error}</p>
            </div>
          ) : (
            <div id="formal-report-content" className="prose prose-invert max-w-none text-textSecondary selection:bg-accent/30 bg-surface2/30 p-6 rounded-xl border border-border/50">
              {formatMarkdown(report)}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isLoading && !error && (
          <div className="p-5 border-t border-border bg-surface2/50 rounded-b-2xl flex items-center justify-end gap-3 shrink-0">
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all ${
                isCopied ? 'bg-aggressor-bg/20 text-aggressor-text border border-aggressor-border/50' : 'bg-surface3 text-textPrimary hover:bg-surface2 border border-border'
              }`}
            >
              {isCopied ? <Check size={16} /> : <Copy size={16} />}
              <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all bg-surface3 text-textPrimary hover:bg-surface2 border border-border disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span className="hidden sm:inline">{isDownloading ? 'Downloading' : 'Download PDF'}</span>
            </button>
            <button 
              onClick={() => {
                const bodyText = report.length > 1500 ? report.substring(0, 1500) + '\n\n...[Report Truncated due to email limits. Please use the Download PDF button in CoachLens for the full report.]' : report;
                const mailto = `mailto:?subject=${encodeURIComponent(`Match Report: ${match.teamName}`)}&body=${encodeURIComponent(bodyText)}`;
                window.location.href = mailto;
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all bg-accent hover:bg-accentHover text-white shadow-glow-amber btn-press"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Email</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
