import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PlayerCard from '../components/PlayerCard/PlayerCard';
import TeamReport from '../components/TeamReport/TeamReport';
import CoachBrief from '../components/CoachBrief/CoachBrief';

export default function MatchResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('players');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const matches = storageService.getMatches();
    const found = matches.find(m => m.id === id);
    if (found) {
      setMatch(found);
    } else {
      navigate('/dashboard');
    }
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

  return (
    <div className="min-h-full">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {match.analysis.players && match.analysis.players.map((player, idx) => (
              <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}>
                <PlayerCard player={player} />
              </div>
            ))}
          </div>
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
            <CoachBrief brief={match.analysis.coach_decisions} />
          </div>
        )}
      </div>
    </div>
  );
}
