import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Loader2, Check, AlertCircle, RotateCcw, Copy, CheckCircle, Zap, Pencil } from 'lucide-react';
import { groqService } from '../../services/groqService';
import { storageService } from '../../services/storageService';

const preprocessImage = (imageFile) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const MAX_DIM = 2048;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        
        try {
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;
          
          let sum = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            const v = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = v;
            sum += v;
          }
          
          const avg = sum / (w * h);
          const threshold = avg * 0.85;
          
          for (let i = 0; i < data.length; i += 4) {
            const v = data[i];
            const newVal = v < threshold ? 0 : 255;
            data[i] = newVal;
            data[i+1] = newVal;
            data[i+2] = newVal;
          }
          
          ctx.putImageData(imgData, 0, 0);
          canvas.toBlob((blob) => {
            resolve(blob || imageFile);
          }, 'image/png');
        } catch (err) {
          console.warn("Canvas manipulation failed, raw image passed:", err);
          resolve(imageFile);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  });
};

export default function ScorecardScanner({ onScanComplete }) {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedText, setScannedText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStep, setAnalyzeStep] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
    setScannedText('');
    setCopied(false);
  };

  const handleScan = async () => {
    if (!image) return;
    setIsScanning(true);
    setProgress(0);
    setError('');
    setScannedText('');

    try {
      const Tesseract = await import('tesseract.js');
      
      const processedImage = await preprocessImage(image);
      
      const result = await Tesseract.recognize(processedImage, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const text = result.data.text.trim();
      if (!text) {
        setError('No text detected. Try a clearer photo with good lighting.');
      } else {
        setScannedText(text);
      }
    } catch (err) {
      console.error('OCR failed:', err);
      setError(`OCR failed: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scannedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = scannedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDirectAnalyze = async () => {
    if (!scannedText.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeProgress(10);
    setAnalyzeStep('Reading scorecard...');

    const startTime = Date.now();

    const handleProgress = (stage) => {
      if (stage === 'stage1') { setAnalyzeStep('Analyzing players...'); setAnalyzeProgress(30); }
      if (stage === 'stage2') { setAnalyzeStep('Building team report...'); setAnalyzeProgress(60); }
      if (stage === 'stage3') { setAnalyzeStep('Preparing coach brief...'); setAnalyzeProgress(85); }
      if (stage === 'stage4') { setAnalyzeStep('Finalizing...'); setAnalyzeProgress(100); }
    };

    try {
      const analysisData = await groqService.analyze(scannedText, 'T20', 'Full Match', 'Direct', handleProgress);
      const totalTimeMs = Date.now() - startTime;

      // Detect result
      const detectResult = (data) => {
        if (data?.team_summary?.result) return data.team_summary.result;
        const combined = JSON.stringify(data || '').toLowerCase();
        if (combined.includes('won the match') || combined.includes('won by') || combined.includes('successful chase') || combined.includes('defended')) return 'Won';
        if (combined.includes('lost the match') || combined.includes('lost by') || combined.includes('failed to chase') || combined.includes('fell short')) return 'Lost';
        return null;
      };

      // Extract team names
      const extractTeams = (text) => {
        const vsMatch = text.match(/^(.+?)\s+(?:vs\.?|versus)\s+(.+?)(?:\s*[-–—]|\n)/im);
        if (vsMatch) return { teamName: vsMatch[1].trim(), opponent: vsMatch[2].trim() };
        const inningsMatches = text.match(/^(.+?)\s+(?:innings|batting)/gim);
        if (inningsMatches && inningsMatches.length >= 2) {
          return {
            teamName: inningsMatches[0].replace(/\s*(innings|batting).*/i, '').trim(),
            opponent: inningsMatches[1].replace(/\s*(innings|batting).*/i, '').trim(),
          };
        }
        return { teamName: 'Team A', opponent: 'Team B' };
      };

      const teams = extractTeams(scannedText);

      const newMatchRecord = {
        format: 'T20',
        phase: 'Full Match',
        rawScorecard: scannedText,
        analysis: analysisData,
        teamName: teams.teamName,
        opponent: teams.opponent,
        result: detectResult(analysisData),
        processingTime: totalTimeMs,
      };

      const savedMatch = await storageService.saveMatch(newMatchRecord);
      navigate(`/match/${savedMatch.id}`);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(`Analysis failed: ${err.message}`);
      setIsAnalyzing(false);
    }
  };

  const handleUseText = () => {
    if (scannedText && onScanComplete) {
      onScanComplete(scannedText);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setScannedText('');
    setError('');
    setProgress(0);
    setCopied(false);
    setIsAnalyzing(false);
    setIsEditing(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  // Analyzing overlay
  if (isAnalyzing) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 relative mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-3 rounded-full border border-border" />
          <div className="absolute inset-3 rounded-full border-t border-accent/50 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
        <div>
          <h3 className="text-lg font-display text-textPrimary mb-1">Analyzing Scorecard...</h3>
          <p className="text-xs font-mono text-accent uppercase tracking-wider">{analyzeStep}</p>
        </div>
        <div className="w-full bg-surface2 rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent to-accentHover rounded-full transition-all duration-500" style={{ width: `${analyzeProgress}%` }} />
        </div>
        <p className="text-[10px] font-mono text-textTertiary uppercase tracking-wider">AI is processing your OCR-captured scorecard</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!preview ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-accent/50 rounded-2xl p-10 cursor-pointer transition-all bg-surface2/30 hover:bg-surface2/60 group">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Camera size={28} className="text-accent" />
          </div>
          <p className="text-sm font-display text-textPrimary mb-1">Upload Scorecard Photo</p>
          <p className="text-xs font-mono text-textTertiary text-center max-w-xs">Take a photo of a handwritten scorebook or printed scorecard. OCR will extract the text automatically.</p>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img src={preview} alt="Scorecard" className="w-full max-h-64 object-contain bg-primary" />
            <button onClick={reset} className="absolute top-3 right-3 p-2 rounded-xl bg-primary/80 backdrop-blur-sm border border-border text-textSecondary hover:text-textPrimary transition-colors">
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Scan Button */}
          {!scannedText && !isScanning && (
            <button onClick={handleScan} className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-accent">
              <Upload size={16} /> Scan & Extract Text
            </button>
          )}

          {/* Progress */}
          {isScanning && (
            <div className="glass-card rounded-2xl p-5 text-center space-y-3">
              <Loader2 size={24} className="animate-spin mx-auto text-accent" />
              <p className="text-sm font-display text-textPrimary">Scanning scorecard...</p>
              <div className="w-full bg-surface2 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs font-mono text-textTertiary">{progress}% complete</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-liability-bg/10 border border-liability-border/30">
              <AlertCircle size={16} className="text-liability-text shrink-0 mt-0.5" />
              <p className="text-sm text-liability-text font-mono">{error}</p>
            </div>
          )}

          {/* Scanned Text Result */}
          {scannedText && (
            <div className="space-y-4 animate-fade-in">
              {/* Success Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-aggressor-text">
                  <Check size={16} />
                  <span className="text-xs font-mono uppercase tracking-wider">Text Extracted Successfully</span>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 text-xs font-mono text-textSecondary hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-surface2"
                >
                  <Pencil size={12} />
                  {isEditing ? 'Done Editing' : 'Edit Text'}
                </button>
              </div>

              {/* Text Display / Editor */}
              {isEditing ? (
                <textarea
                  value={scannedText}
                  onChange={(e) => setScannedText(e.target.value)}
                  className="w-full h-56 bg-surface2 border border-accent/30 rounded-xl p-4 text-textPrimary font-mono text-xs resize-y focus:outline-none focus:border-accent focus:shadow-glow-accent transition-all"
                />
              ) : (
                <div className="bg-surface2 border border-border rounded-xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                  <pre className="text-xs font-mono text-textSecondary whitespace-pre-wrap leading-relaxed">{scannedText}</pre>
                </div>
              )}

              {/* Character Count */}
              <div className="text-right">
                <span className="text-[10px] font-mono text-textTertiary">{scannedText.length} characters extracted</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Copy to Clipboard */}
                <button
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-mono font-bold uppercase tracking-wider transition-all btn-press border ${
                    copied
                      ? 'bg-aggressor-bg text-aggressor-text border-aggressor-border'
                      : 'bg-surface2 hover:bg-surface3 text-textPrimary border-border'
                  }`}
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Scorecard'}
                </button>

                {/* Direct Analyze */}
                <button
                  onClick={handleDirectAnalyze}
                  className="flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white py-3.5 rounded-xl text-sm font-mono font-bold uppercase tracking-wider transition-all btn-press shadow-glow-accent"
                >
                  <Zap size={16} />
                  Analyze Now
                </button>
              </div>

              {/* Use in Analysis Flow (if callback provided) */}
              {onScanComplete && (
                <button
                  onClick={handleUseText}
                  className="w-full flex items-center justify-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textSecondary hover:text-textPrimary py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all"
                >
                  <Check size={14} />
                  Use in Analysis Flow Instead
                </button>
              )}

              {/* Retry */}
              <button onClick={reset} className="w-full flex items-center justify-center gap-2 text-textTertiary hover:text-textSecondary py-2 text-xs font-mono uppercase tracking-wider transition-colors">
                <RotateCcw size={12} />
                Scan Different Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
