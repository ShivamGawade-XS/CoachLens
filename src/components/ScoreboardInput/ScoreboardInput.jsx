import React, { useState } from 'react';
import { ChevronLeft, Clipboard, AlertCircle } from 'lucide-react';
import { parseScorecard } from '../../utils/parseScorecard';

const SAMPLE_SCORECARD = `Panaji Panthers vs Margao Strikers - T20 Match
Date: 5 May 2026

Panaji Panthers Batting:
1. Rahul Sharma - 19 (28) [4x1, 6x0] SR: 67.8
2. Vikas Patel - 34 (21) [4x4, 6x1] SR: 161.9
3. Suresh Raina - 45 (40) [4x2, 6x0] SR: 112.5
4. Karan Nair - 8 (12) [4x0, 6x0] SR: 66.7
5. Rohit Singh - 28 (18) [4x3, 6x1] SR: 155.5
Extras: 12
Total: 146/4 (20 overs)

Margao Strikers Bowling:
1. Amit Shah - 4-0-28-1 ER: 7.0
2. Dev Kumar - 4-0-54-0 ER: 13.5
3. Priya Desai - 4-0-22-2 ER: 5.5
4. Jay Patel - 4-0-18-1 ER: 4.5
5. Rohan Verma - 4-0-24-0 ER: 6.0`;

export default function ScoreboardInput({ onAnalyze, onBack }) {
  const [format, setFormat] = useState('T20');
  const [phase, setPhase] = useState('Full Match');
  const [scorecardText, setScorecardText] = useState('');
  const [error, setError] = useState(null);
  
  const handleAnalyze = () => {
    const { isValid, error: parseError } = parseScorecard(scorecardText);
    if (!isValid) {
      setError(parseError);
      return;
    }
    setError(null);
    onAnalyze(format, phase, scorecardText);
  };

  const handleLoadSample = () => {
    setScorecardText(SAMPLE_SCORECARD);
    setError(null);
  };

  const formats = ['T20', 'ODI'];
  const phases = ['Full Match', 'Powerplay', 'Middle Overs', 'Death Overs'];

  return (
    <div className="min-h-screen bg-primary relative">
      <div className="ambient-gradient" />
      
      <div className="max-w-2xl mx-auto w-full px-4 py-6 md:py-10 relative z-10">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center text-textSecondary hover:text-textPrimary transition-colors mb-8 text-sm group"
        >
          <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-lg font-display mb-2">New Match Analysis</h1>
          <p className="text-textSecondary text-sm">Paste your scorecard and get AI-powered coaching intelligence in seconds.</p>
        </div>

        <div className="space-y-6">
          {/* Format + Phase Card */}
          <div className="glass-card rounded-xl p-6">
            {/* Match Format */}
            <div className="mb-6">
              <label className="block text-[10px] text-textSecondary mb-3 uppercase tracking-[0.2em] font-medium">Match Format</label>
              <div className="flex gap-2">
                {formats.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-5 py-2 text-sm font-mono font-medium tracking-wider transition-all duration-200 rounded-xl ${
                      format === f 
                        ? 'bg-accent text-white shadow-glow-amber' 
                        : 'bg-surface2 text-textSecondary hover:text-textPrimary hover:bg-surface3 border border-border'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Phase Focus */}
            <div>
              <label className="block text-[10px] text-textSecondary mb-3 uppercase tracking-[0.2em] font-medium">Phase Focus</label>
              <div className="flex flex-wrap gap-2">
                {phases.map(p => (
                  <button
                    key={p}
                    onClick={() => setPhase(p)}
                    className={`px-4 py-2 text-xs font-mono tracking-wider transition-all duration-200 rounded-xl ${
                      phase === p 
                        ? 'bg-accent/15 text-accent border border-accent/40' 
                        : 'bg-surface2 text-textSecondary hover:text-textPrimary hover:bg-surface3 border border-border'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scorecard Input Card */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] text-textSecondary uppercase tracking-[0.2em] font-medium">Scorecard Data</label>
              <button
                onClick={handleLoadSample}
                className="flex items-center gap-1.5 text-[10px] text-accent hover:text-accentHover transition-colors uppercase tracking-wider font-medium"
              >
                <Clipboard size={11} /> Load Sample
              </button>
            </div>
            
            <textarea 
              value={scorecardText}
              onChange={(e) => { setScorecardText(e.target.value); setError(null); }}
              placeholder="Paste CricHeroes scorecard, plain text, or any structured data here..."
              className="w-full h-52 bg-surface2 border border-border rounded-xl p-4 text-textPrimary placeholder-textTertiary focus:outline-none focus:border-accent focus:shadow-glow-amber font-mono text-sm resize-y transition-all duration-200"
            />
            
            <div className="flex items-center justify-between mt-2">
              <div>
                {error && (
                  <p className="text-liability-text text-xs flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle size={12} />
                    {error}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-textTertiary">
                {scorecardText.length} characters
              </span>
            </div>
          </div>

          {/* Analyze Button */}
          <button 
            onClick={handleAnalyze}
            disabled={!scorecardText.trim()}
            className={`w-full font-mono font-bold text-sm tracking-wider uppercase py-4 transition-all duration-200 btn-press rounded-xl ${
              scorecardText.trim()
                ? 'bg-accent hover:bg-accentHover text-white shadow-glow-amber'
                : 'bg-surface2 text-textTertiary cursor-not-allowed'
            }`}
          >
            ▶ Analyze Match
          </button>
        </div>
      </div>
    </div>
  );
}
