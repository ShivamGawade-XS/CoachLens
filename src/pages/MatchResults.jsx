import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Download, Loader2, MessageCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { groqService } from '../services/groqService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PlayerCard from '../components/PlayerCard/PlayerCard';
import TeamReport from '../components/TeamReport/TeamReport';
import CoachBrief from '../components/CoachBrief/CoachBrief';
import WhatsAppModal from '../components/WhatsAppModal/WhatsAppModal';

export default function MatchResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('players');
  const [isExporting, setIsExporting] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsAppMessages, setWhatsAppMessages] = useState([]);
  const [isGeneratingWA, setIsGeneratingWA] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      const matches = await storageService.getMatches();
      const found = matches.find(m => m.id === id);
      if (found) {
        setMatch(found);
      } else {
        navigate('/dashboard');
      }
    };
    fetchMatch();
  }, [id, navigate]);

  if (!match) return null;

  const tabs = [
    { key: 'players', label: 'Players', icon: '👤' },
    { key: 'team', label: 'Team Report', icon: '📊' },
    { key: 'brief', label: 'Coach Brief', icon: '📋' },
  ];

  const handleExportPDF = async () => {
    const element = document.getElementById('export-content-area');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const isDark = document.documentElement.classList.contains('dark');
      const canvas = await html2canvas(element, {
        backgroundColor: isDark ? '#0A0C10' : '#F8FAFC',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const filename = `CoachLens-${match.teamName.replace(/\s+/g, '-')}-${activeTab}-Report.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateWhatsApp = async () => {
    if (!match.analysis.players?.length) return;
    setShowWhatsApp(true);
    setIsGeneratingWA(true);
    setWhatsAppMessages([]);
    try {
      const messages = await groqService.generateWhatsAppMessages(match.analysis.players);
      setWhatsAppMessages(messages);
    } catch (err) {
      console.error('Failed to generate WhatsApp messages:', err);
      // Fallback: generate simple messages locally
      const fallbackMsgs = match.analysis.players.map(p => ({
        name: p.name,
        role: p.role,
        message: `Great effort with your ${p.key_stat || 'performance'} today — keep building on what worked. This week, focus on: ${p.practice_drill || p.next_match_instruction || 'net sessions'}.`
      }));
      setWhatsAppMessages(fallbackMsgs);
    } finally {
      setIsGeneratingWA(false);
    }
  };

  return (
    <div className="min-h-full">
      {/* Fallback Banner */}
      {match.isFallback && (
        <div className="bg-liability-bg border-b border-liability-border text-liability-text px-4 py-2 text-xs font-mono text-center">
          ⚠️ Using cached analysis — API unavailable
        </div>
      )}

      {/* Sticky Header */}
      <header className="glass border-b border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center">
            <Link 
              to="/dashboard"
              className="text-textSecondary hover:text-textPrimary flex items-center text-sm mr-6 group transition-colors"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl truncate text-textPrimary">
                {match.teamName || 'Match Analysis'}
                {match.opponent && (
                  <span className="text-textSecondary font-mono text-sm ml-2">vs {match.opponent}</span>
                )}
              </h1>
            </div>
            {match.result && (
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mx-3 border ${
                match.result === 'Won' 
                  ? 'bg-aggressor-bg text-aggressor-text border-aggressor-border' 
                  : 'bg-liability-bg text-liability-text border-liability-border'
              }`}>
                {match.result}
              </span>
            )}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {isExporting ? 'Exporting...' : 'PDF'}
            </button>
          </div>
          
          {/* Tab Navigation */}
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 pb-3 pt-1 text-sm tracking-wider uppercase font-medium border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.key 
                    ? 'border-accent text-textPrimary' 
                    : 'border-transparent text-textSecondary hover:text-textPrimary'
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div id="export-content-area" className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16 bg-primary">
        {activeTab === 'players' && (
          <>
            {/* Generate WhatsApp Button */}
            {match.analysis.players?.length > 0 && (
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleGenerateWhatsApp}
                  className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 px-4 py-2.5 rounded-xl text-xs font-mono font-medium uppercase tracking-wider transition-all btn-press"
                >
                  <MessageCircle size={14} />
                  Generate WhatsApp Messages
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {match.analysis.players && match.analysis.players.map((player, idx) => (
                <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}>
                  <PlayerCard player={player} />
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'team' && (
          <div className="animate-fade-in">
            <TeamReport
              report={match.analysis.team_summary}
              rawScorecard={match.rawScorecard}
              teamName={match.teamName}
              opponent={match.opponent}
            />
          </div>
        )}

        {activeTab === 'brief' && (
          <div className="animate-fade-in">
            <CoachBrief match={match} brief={match.analysis.coach_decisions} />
          </div>
        )}

        {/* Timing Display */}
        {match.processingTime && (
          <div className="mt-12 text-center text-[10px] text-textTertiary font-mono uppercase tracking-wider">
            Analysis completed in {(match.processingTime / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      {/* WhatsApp Modal */}
      {showWhatsApp && (
        <WhatsAppModal
          players={match.analysis.players}
          messages={whatsAppMessages}
          isGenerating={isGeneratingWA}
          onClose={() => setShowWhatsApp(false)}
        />
      )}
    </div>
  );
}
