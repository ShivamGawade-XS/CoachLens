import React, { useState } from 'react';
import { X, Loader2, Copy, CheckCircle, MessageCircle, Send } from 'lucide-react';

export default function WhatsAppModal({ messages, isGenerating, onClose }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = messages.map(m => `${m.name}:\n${m.message}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleWhatsApp = (message) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative modal-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4 shadow-2xl animate-scale-pop">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#25D366]/15 text-[#25D366] rounded-lg flex items-center justify-center">
              <MessageCircle size={16} />
            </div>
            <div>
              <h2 className="text-sm font-display text-textPrimary">WhatsApp Messages</h2>
              <p className="text-[10px] text-textTertiary font-mono uppercase tracking-wider">
                {isGenerating ? 'Generating...' : `${messages.length} player messages ready`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isGenerating && messages.length > 0 && (
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-3 py-1.5 rounded-lg transition-colors"
              >
                {copiedAll ? <CheckCircle size={12} className="text-aggressor-text" /> : <Copy size={12} />}
                {copiedAll ? 'Copied ✓' : 'Copy All'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-textTertiary hover:text-textPrimary hover:bg-surface2 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-sm text-textSecondary font-mono">Crafting personal messages...</p>
              <p className="text-[10px] text-textTertiary">AI is analyzing each player&apos;s performance</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="bg-surface2/50 border border-border rounded-xl p-4 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 60}ms`, opacity: 0 }}
                >
                  {/* Player name */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-textPrimary">{msg.name}</h3>
                    <span className="text-[10px] font-mono text-textTertiary uppercase">{msg.role}</span>
                  </div>

                  {/* Message body */}
                  <p className="text-sm text-textPrimary/85 leading-relaxed bg-primary/50 rounded-lg p-3 border border-border font-mono text-xs whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      onClick={() => handleCopy(msg.message, idx)}
                      className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-textSecondary hover:text-textPrimary px-2.5 py-1.5 rounded-lg hover:bg-surface3 transition-colors"
                    >
                      {copiedIdx === idx ? (
                        <><CheckCircle size={11} className="text-aggressor-text" /> <span className="text-aggressor-text">Copied ✓</span></>
                      ) : (
                        <><Copy size={11} /> Copy</>
                      )}
                    </button>
                    <button
                      onClick={() => handleWhatsApp(msg.message)}
                      className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#25D366] hover:bg-[#25D366]/10 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Send size={11} /> Send on WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
