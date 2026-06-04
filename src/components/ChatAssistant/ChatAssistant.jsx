import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { groqService } from '../../services/groqService';
import { getTeams } from '../../pages/AppPages';
import { storageService } from '../../services/storageService';

const SUGGESTED_PROMPTS = [
  { label: '📊 Analyze Match Trends', text: 'Analyze our recent matches and summarize key performance trends.' },
  { label: '🔥 Top Performers', text: 'Who are our top performers right now and what is their match impact?' },
  { label: '💡 Areas to Improve', text: 'Based on our team profile, what are the primary areas we need to improve?' }
];

export default function ChatAssistant() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi Coach! I have your latest team stats and match data loaded. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!isAuthenticated) return null;

  const buildContext = async () => {
    const teams = getTeams(user.id);
    const allMatches = await storageService.getMatches();
    
    // We only take the last 10 matches to save context window tokens
    const recentMatches = allMatches.slice(0, 10).map(m => ({
      team: m.teamName,
      opponent: m.opponent,
      result: m.result,
      format: m.format,
      top_performers: (m.analysis?.players || []).filter(p => parseFloat(p.match_impact || 0) >= 7).map(p => p.name)
    }));

    return {
      coachName: user.fullName,
      teams: teams.map(t => ({
        name: t.name,
        rosterSize: t.roster?.length || 0,
        players: (t.roster || []).map(p => p.name)
      })),
      recentMatches
    };
  };

  const handleSend = async (e, textOverride = null) => {
    e?.preventDefault();
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    if (!textOverride) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const contextData = await buildContext();
      
      // Pass the last 5 messages to the LLM to keep context token count low
      const chatHistory = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
      chatHistory.push({ role: 'user', content: userMessage });

      const reply = await groqService.chatWithCoachLens(chatHistory, contextData);
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I hit a network snag. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-accent hover:bg-accentHover text-white rounded-full shadow-glow-accent transition-all duration-300 btn-press animate-fade-in hover:scale-105 group"
        >
          <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-300 text-amber-200" />
          <span className="text-xs font-semibold tracking-wide">CoachLens AI</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[380px] h-[580px] max-h-[85vh] flex flex-col modal-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-scale-pop">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-surface2/80 border-b border-border/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/15 text-accent rounded-xl border border-accent/25">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-textPrimary animate-fade-in">CoachLens AI</h3>
                <p className="text-[10px] text-textSecondary flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shadow-glow-green animate-pulse" /> Stats Analyst
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-textTertiary hover:text-textPrimary hover:bg-surface3 rounded-lg transition-colors border border-transparent hover:border-border">
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] font-mono tracking-widest text-textTertiary uppercase px-1">
                  {msg.role === 'user' ? 'Coach' : 'CoachLens AI'}
                </span>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-surface3 border border-border text-textPrimary rounded-tr-none max-w-[85%] shadow-sm'
                    : 'bg-accent/[0.05] border border-accent/15 text-textPrimary rounded-tl-none max-w-[88%] shadow-glow-accent/5'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Suggested Prompts (rendered only when greeting message is the only message) */}
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-col gap-2 pt-2 animate-fade-in-up">
                <p className="text-[10px] font-mono tracking-widest text-textTertiary uppercase px-1 mb-1">Suggested Prompts</p>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleSend(e, prompt.text)}
                    className="w-full text-left px-4 py-3 text-xs bg-surface2 hover:bg-surface3 border border-border hover:border-borderHover rounded-xl text-textSecondary hover:text-textPrimary transition-all duration-200 shadow-sm flex items-center justify-between group"
                  >
                    <span>{prompt.label}</span>
                    <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs">→</span>
                  </button>
                ))}
              </div>
            )}
            
            {isLoading && (
              <div className="flex flex-col gap-1.5 items-start">
                <span className="text-[9px] font-mono tracking-widest text-textTertiary uppercase px-1">
                  CoachLens AI
                </span>
                <div className="px-4 py-3.5 rounded-2xl bg-accent/[0.05] border border-accent/15 rounded-tl-none flex items-center gap-1.5 shadow-glow-accent/5">
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface2/60 border-t border-border/60 backdrop-blur-md">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about team status or player metrics..."
                className="w-full bg-surface3/80 border border-border text-sm text-textPrimary placeholder:text-textTertiary rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2.5 p-1.5 text-accent hover:text-accentHover hover:bg-accent/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
