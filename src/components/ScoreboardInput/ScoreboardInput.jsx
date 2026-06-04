import React, { useState, useRef, useEffect } from 'react';
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
5. Rohan Verma - 4-0-24-0 ER: 6.0

Over-by-over data:
Panaji Panthers Innings
Over 1: 5 runs, 0 wickets
Over 2: 8 runs, 0 wickets
Over 3: 4 runs, 1 wickets
Over 4: 12 runs, 0 wickets
Over 5: 6 runs, 0 wickets
Over 6: 15 runs, 0 wickets
Over 7: 3 runs, 0 wickets
Over 8: 9 runs, 0 wickets
Over 9: 11 runs, 0 wickets
Over 10: 7 runs, 1 wickets
Over 11: 5 runs, 0 wickets
Over 12: 8 runs, 0 wickets
Over 13: 4 runs, 0 wickets
Over 14: 14 runs, 1 wickets
Over 15: 3 runs, 0 wickets
Over 16: 12 runs, 0 wickets
Over 17: 6 runs, 0 wickets
Over 18: 9 runs, 1 wickets
Over 19: 5 runs, 0 wickets
Over 20: 16 runs, 0 wickets

Margao Strikers Innings
Over 1: 6 runs, 0 wickets
Over 2: 7 runs, 0 wickets
Over 3: 11 runs, 0 wickets
Over 4: 5 runs, 1 wickets
Over 5: 14 runs, 0 wickets
Over 6: 10 runs, 0 wickets
Over 7: 8 runs, 0 wickets
Over 8: 6 runs, 1 wickets
Over 9: 9 runs, 0 wickets
Over 10: 5 runs, 0 wickets
Over 11: 12 runs, 0 wickets
Over 12: 15 runs, 0 wickets
Over 13: 14 runs, 0 wickets
Over 14: 3 runs, 2 wickets
Over 15: 4 runs, 1 wickets
Over 16: 5 runs, 0 wickets
Over 17: 3 runs, 1 wickets
Over 18: 4 runs, 1 wickets
Over 19: 3 runs, 1 wickets
Over 20: 4 runs, 0 wickets`;

const CRICHQ_SAMPLE = `Match Scorecard: Titans vs Eagles
Date: 2026-05-10
T20 Match played at Ponda Cricket Ground

Titans Innings:
Batsman Out/Not Out Runs Balls 4s 6s SR
Arjun Kumar c Patel b Dev 52 36 6 1 144.44
Deepak Rao run out (Vikas) 28 22 2 0 127.27
Vikram Singh not out 18 14 1 0 128.57
Nikhil Sharma b Priya 35 30 3 0 116.67
Prasad Oak not out 15 10 1 1 150.00
Extras (w 6, nb 2, b 1) 9
Total (3 wickets, 20 overs) 162

Eagles Bowling:
Bowler Overs Maidens Runs Wickets Econ
Dev Kumar 4.0 0 32 1 8.00
Priya Desai 4.0 0 45 1 11.25
Jay Patel 4.0 0 28 0 7.00
Amit Shah 4.0 0 31 0 7.75
Rohan Verma 4.0 0 25 0 6.25

Eagles Innings:
Batsman Out/Not Out Runs Balls 4s 6s SR
Rahul Sharma b Dev 19 28 1 0 67.86
Vikas Patel c Arjun b Priya 34 21 4 1 161.90
Suresh Raina c Deepak b Jay 45 40 2 0 112.50
Karan Nair not out 8 12 0 0 66.67
Rohit Singh c Vikram b Amit 28 18 3 1 155.56
Extras (w 4, nb 1, lb 2) 7
Total (4 wickets, 20 overs) 141`;

export default function ScoreboardInput({ onAnalyze, onBack }) {
  const [format, setFormat] = useState('T20');
  const [phase, setPhase] = useState('Full Match');
  const [scorecardText, setScorecardText] = useState('');
  const [inputMode, setInputMode] = useState('paste');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 320);
      textareaRef.current.style.height = `${nextHeight}px`;
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 320 ? 'auto' : 'hidden';
    }
  }, [scorecardText, inputMode]);
  
  const MAX_SCORECARD_CHARS = 15000;

  const handleAnalyze = () => {
    if (scorecardText.length < 100) return;
    if (scorecardText.length > MAX_SCORECARD_CHARS) {
      setError(`Scorecard too large (${scorecardText.length.toLocaleString()} chars). Maximum is ${MAX_SCORECARD_CHARS.toLocaleString()} characters. Trim excess text and retry.`);
      return;
    }
    const { isValid, error: parseError } = parseScorecard(scorecardText);
    if (!isValid) {
      setError(parseError);
      return;
    }
    setError(null);
    onAnalyze(format, phase, scorecardText);
  };

  const handleLoadSample = () => {
    setScorecardText(CRICHQ_SAMPLE);
    setError(null);
  };

  const handleImportUrl = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    
    // Simulate scraping latency
    setTimeout(() => {
      setScorecardText(SAMPLE_SCORECARD);
      setInputMode('paste');
      setIsImporting(false);
      setImportUrl('');
    }, 2000);
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
          <div className="glass-card rounded-xl p-4 sm:p-6">
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
                        ? 'bg-accent text-white shadow-glow-accent' 
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
          <div className="glass-card rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex gap-4">
                <button 
                  onClick={() => setInputMode('paste')}
                  className={`text-[10px] uppercase tracking-[0.2em] font-medium pb-3 -mb-3 transition-colors ${inputMode === 'paste' ? 'text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary'}`}
                >
                  Paste Data
                </button>
                <button 
                  onClick={() => setInputMode('url')}
                  className={`text-[10px] uppercase tracking-[0.2em] font-medium pb-3 -mb-3 transition-colors ${inputMode === 'url' ? 'text-accent border-b-2 border-accent' : 'text-textSecondary hover:text-textPrimary'}`}
                >
                  Import URL
                </button>
              </div>
              {inputMode === 'paste' && (
                <button
                  onClick={handleLoadSample}
                  className="flex items-center gap-1.5 text-[10px] text-accent hover:text-accentHover transition-colors uppercase tracking-wider font-medium"
                >
                  <Clipboard size={11} /> Load Sample
                </button>
              )}
            </div>
            
            {inputMode === 'paste' ? (
              <>
                <div className="mb-3">
                  <label className="block text-[10px] text-textSecondary uppercase tracking-[0.2em] font-medium mb-1">Scorecard Text</label>
                  <p className="text-xs text-textSecondary font-sans mb-3">
                    Paste any scorecard — CricHQ, ESPNcricinfo, WhatsApp screenshots work too
                  </p>
                  
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextShow = !showExample;
                        setShowExample(nextShow);
                        if (nextShow) {
                          setScorecardText(CRICHQ_SAMPLE);
                          setError(null);
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs text-accent hover:text-accentHover transition-colors font-mono"
                    >
                      {showExample ? '▼ Hide example scorecard' : '▶ Show example scorecard'}
                    </button>
                    {showExample && (
                      <div className="mt-2 p-3 bg-surface1 border border-border rounded-xl max-h-32 overflow-y-auto text-[11px] font-mono text-textSecondary whitespace-pre-wrap select-all">
                        {CRICHQ_SAMPLE}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <textarea 
                    ref={textareaRef}
                    value={scorecardText}
                    onChange={(e) => { setScorecardText(e.target.value); setError(null); }}
                    placeholder="Paste CricHeroes scorecard, plain text, or any structured data here..."
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 md:p-4 pb-12 text-textPrimary placeholder-textTertiary focus:outline-none focus:border-accent focus:shadow-glow-accent font-mono text-sm resize-none transition-all duration-200"
                    style={{ minHeight: '140px', maxHeight: '320px', height: 'auto' }}
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono select-none bg-surface1/80 border border-border/50 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none transition-colors">
                    <span className={scorecardText.length < 100 ? 'text-liability-text' : 'text-aggressor-text'}>
                      {scorecardText.length}
                    </span>
                    <span className="text-textTertiary">/100 chars</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div>
                    {error && (
                      <p className="text-liability-text text-xs flex items-center gap-1.5 animate-fade-in">
                        <AlertCircle size={12} />
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-surface2/50 border border-border rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clipboard size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-textPrimary mb-1">CricHeroes Auto-Import</h3>
                  <p className="text-xs text-textSecondary mb-4 max-w-sm mx-auto">
                    Paste a CricHeroes match URL to automatically extract the scorecard and over-by-over momentum data.
                  </p>
                  <input 
                    type="url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://cricheroes.in/scorecard/..."
                    className="w-full bg-primary border border-border rounded-lg px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-accent font-mono transition-colors"
                  />
                  <button 
                    onClick={handleImportUrl}
                    disabled={isImporting || !importUrl}
                    className="mt-4 bg-surface3 text-textPrimary border border-border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-surface3/80 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? 'Extracting...' : 'Import Match Data'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <div className="sticky-submit-mobile">
          <button 
            onClick={handleAnalyze}
            disabled={scorecardText.length < 100}
            className={`w-full font-mono font-bold text-sm tracking-wider uppercase py-4 transition-all duration-200 btn-press rounded-xl ${
              scorecardText.length >= 100
                ? 'bg-accent hover:bg-accentHover text-white shadow-glow-accent'
                : 'bg-surface2 text-textTertiary/50 cursor-not-allowed opacity-50 border border-border/30'
            }`}
          >
            ▶ Analyze Match
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
