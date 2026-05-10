import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Check, AlertCircle, RotateCcw } from 'lucide-react';

export default function ScorecardScanner({ onScanComplete }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedText, setScannedText] = useState('');
  const [error, setError] = useState('');
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
  };

  const handleScan = async () => {
    if (!image) return;
    setIsScanning(true);
    setProgress(0);
    setError('');
    setScannedText('');

    try {
      // Dynamic import to avoid loading Tesseract until needed
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(image, 'eng', {
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
    if (fileRef.current) fileRef.current.value = '';
  };

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
            <button onClick={handleScan} className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber">
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

          {/* Scanned Text */}
          {scannedText && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-aggressor-text">
                <Check size={16} />
                <span className="text-xs font-mono uppercase tracking-wider">Text Extracted Successfully</span>
              </div>
              <div className="bg-surface2 border border-border rounded-xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                <pre className="text-xs font-mono text-textSecondary whitespace-pre-wrap leading-relaxed">{scannedText}</pre>
              </div>
              <div className="flex gap-3">
                <button onClick={handleUseText} className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white font-mono font-bold py-3 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber">
                  <Check size={16} /> Use This Scorecard
                </button>
                <button onClick={reset} className="px-4 py-3 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textSecondary font-mono text-sm transition-all">
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
