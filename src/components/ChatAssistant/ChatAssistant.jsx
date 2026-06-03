import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { groqService } from '../../services/groqService';
import { getTeams } from '../../pages/AppPages';
import { storageService } from '../../services/storageService';

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

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
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
          className="fixed bottom-6 right-6 z-50 p-4 bg-accent hover:bg-accentHover text-white rounded-full shadow-glow-amber transition-all btn-press animate-fade-in"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[360px] h-[550px] max-h-[85vh] flex flex-col glass-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-scale-pop">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-surface2 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 text-accent rounded-xl">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-sm font-display text-textPrimary">CoachLens AI</h3>
                <p className="text-[10px] font-mono text-accent flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-textTertiary hover:text-textPrimary hover:bg-surface3 rounded-lg transition-colors">
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-surface3 text-textSecondary' : 'bg-accent text-white'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-surface2 border border-border text-textPrimary rounded-tr-sm' : 'bg-accent/10 border border-accent/20 text-textPrimary rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-accent/10 border border-accent/20 rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface2 border-t border-border">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your team..."
                className="w-full bg-surface3 border border-border text-sm text-textPrimary placeholder:text-textTertiary rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-1.5 text-accent hover:text-accentHover hover:bg-accent/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
