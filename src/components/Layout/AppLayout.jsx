import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Clock, Trophy, ChevronRight, Home, Settings, LogOut } from 'lucide-react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewAnalysis = () => {
    navigate('/analyze');
  };

  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Trophy size={18} />, label: 'My Teams', path: '/teams' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-primary relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="ambient-gradient" />

      {/* ── Sidebar (Desktop) ── */}
      <div className="hidden md:flex w-72 border-r border-border glass flex-col relative z-20">
        {/* Brand Header */}
        <div className="p-5 border-b border-border">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="CoachLens" className="h-8 object-contain dark:brightness-100 brightness-0" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-sm ${
                location.pathname === item.path
                  ? 'bg-surface2 text-accent border border-border font-medium'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surface2/50 border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Profile Mock & Actions */}
        <div className="p-4 border-t border-border flex flex-col gap-4">
          <button 
            onClick={handleNewAnalysis}
            className="w-full flex items-center justify-center bg-accent hover:bg-accentHover text-white font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-amber"
          >
            <Plus size={16} className="mr-2" /> New Analysis
          </button>
          
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface3 border border-border flex items-center justify-center text-textPrimary font-mono font-bold text-xs">
                SG
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-textPrimary">Coach Shivam</span>
                <span className="text-[10px] text-textTertiary">Pro Plan</span>
              </div>
            </div>
            <Link to="/" className="text-textTertiary hover:text-liability-text transition-colors">
              <LogOut size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-border z-30 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="CoachLens" className="h-7 object-contain dark:brightness-100 brightness-0" />
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleNewAnalysis}
            className="w-8 h-8 flex items-center justify-center bg-accent text-white rounded-lg shadow-glow-amber"
          >
            <Plus size={16} />
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 relative z-10 overflow-y-auto pt-16 md:pt-0">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
