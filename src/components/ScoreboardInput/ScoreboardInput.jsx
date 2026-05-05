import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { parseScorecard } from '../../utils/parseScorecard';

export default function ScoreboardInput({ onAnalyze, onBack }) {
  const [format, setFormat] = useState('T20');
  const [phase, setPhase] = useState('Powerplay');
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

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 md:py-8">
      <button 
        onClick={onBack}
        className="flex items-center text-textSecondary hover:text-textPrimary transition-colors mb-6 text-sm"
      >
        <ChevronLeft size={16} className="mr-1" /> Back
      </button>

      <h1 className="text-display-lg font-display mb-8">New Match Analysis</h1>

      <div className="space-y-6">
        <div className="bg-surface1 rounded-lg border border-border p-5">
          <div className="mb-6">
            <label className="block text-body-sm text-textSecondary mb-3 uppercase tracking-wider">Match Format</label>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="format" 
                  value="T20" 
                  checked={format === 'T20'}
                  onChange={() => setFormat('T20')}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${format === 'T20' ? 'border-accent' : 'border-border'}`}>
                  {format === 'T20' && <div className="w-2 h-2 rounded-full bg-accent" />}
                </div>
                T20
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="format" 
                  value="ODI" 
                  checked={format === 'ODI'}
                  onChange={() => setFormat('ODI')}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${format === 'ODI' ? 'border-accent' : 'border-border'}`}>
                  {format === 'ODI' && <div className="w-2 h-2 rounded-full bg-accent" />}
                </div>
                ODI
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-body-sm text-textSecondary mb-3 uppercase tracking-wider">Phase Focus</label>
            <div className="flex flex-wrap gap-4">
              {['Full Match', 'Powerplay', 'Middle Overs', 'Death Overs'].map(p => (
                <label key={p} className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="phase" 
                    value={p} 
                    checked={phase === p}
                    onChange={() => setPhase(p)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${phase === p ? 'border-accent' : 'border-border'}`}>
                    {phase === p && <div className="w-2 h-2 rounded-full bg-accent" />}
                  </div>
                  <span className="text-sm">{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-body-sm text-textSecondary mb-3 uppercase tracking-wider">Scorecard Data</label>
            <textarea 
              value={scorecardText}
              onChange={(e) => { setScorecardText(e.target.value); setError(null); }}
              placeholder="Paste CricHeroes scorecard, plain text, or any structured data here..."
              className="w-full h-48 bg-surface2 border border-border rounded-md p-4 text-textPrimary placeholder-textTertiary focus:outline-none focus:border-accent font-mono text-sm resize-y"
            />
            {error && <p className="text-liability-text text-xs mt-2">{error}</p>}
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          className="w-full bg-accent hover:bg-accentHover text-primary font-mono font-bold text-sm tracking-wider uppercase py-4 transition-colors"
        >
          ▶ Analyze Match
        </button>
      </div>
    </div>
  );
}
