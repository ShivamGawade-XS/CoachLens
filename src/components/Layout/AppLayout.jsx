import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trophy, Settings, LogOut, LayoutDashboard, Menu, X, Wrench, BarChart3, Users } from 'lucide-react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout({ addToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast?.('Dugout network re-connected. Sync active.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast?.('Dugout offline mode active. Using local data.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  const handleNewAnalysis = () => {
    setIsMobileMenuOpen(false);
    navigate('/analyze');
  };

  const handleLogout = () => {
    logout();
    addToast?.('Logged out successfully', 'info');
    navigate('/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Trophy size={18} />, label: 'My Teams', path: '/teams' },
    { icon: <Users size={18} />, label: 'Players', path: '/players' },
    { icon: <BarChart3 size={18} />, label: 'Rankings', path: '/rankings' },
    { icon: <Wrench size={18} />, label: 'Coach Tools', path: '/tools' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
  ];

  const userInitials = user?.avatar || user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const userName = user?.fullName || 'Coach';
  const userRole = user?.role || 'Coach';

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
                  ? 'bg-accent/10 text-accent border border-accent/20 font-bold shadow-[0_0_15px_rgba(232,160,32,0.1)]'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surface2/50 border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Profile & Actions */}
        <div className="p-4 border-t border-border flex flex-col gap-4">
          <button 
            onClick={handleNewAnalysis}
            className="w-full flex items-center justify-center bg-accent hover:bg-accentHover text-white font-mono font-bold py-3.5 text-sm uppercase tracking-wider transition-all btn-press rounded-xl shadow-glow-accent"
          >
            <Plus size={16} className="mr-2" /> New Analysis
          </button>
          
          <div className="flex items-center justify-between pt-2">
            <Link to="/settings" className="flex items-center gap-3 hover:bg-surface2/60 p-2 rounded-xl transition-colors flex-1 min-w-0 group">
              <div className="shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-mono font-bold text-xs group-hover:bg-accent group-hover:text-white transition-colors">
                {userInitials}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-medium text-textPrimary truncate group-hover:text-accent transition-colors">{userName}</span>
                <span className="text-[10px] text-textTertiary truncate">{userRole}</span>
              </div>
            </Link>
            <button onClick={handleLogout} className="shrink-0 p-2 text-textTertiary hover:text-liability-text hover:bg-liability-bg/20 transition-colors rounded-xl" title="Log out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Shell ── */}
      <div className="flex flex-col flex-1 relative z-10 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 glass border-b border-border flex items-center justify-between px-4 shrink-0">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="CoachLens" className="h-7 object-contain dark:brightness-100 brightness-0" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-textPrimary bg-surface2 rounded-lg border border-border"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-over Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute top-16 left-0 right-0 glass border-b border-border p-6 space-y-4 animate-fade-in">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-mono text-sm ${
                    location.pathname === item.path
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-textSecondary hover:text-textPrimary bg-surface2 border border-border'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={handleNewAnalysis}
                className="w-full flex items-center justify-center bg-accent text-white font-mono font-bold py-4 rounded-xl text-sm uppercase tracking-wider"
              >
                <Plus size={16} className="mr-2" /> New Analysis
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 bg-surface2 border border-border text-textSecondary font-mono py-3 rounded-xl text-sm"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto">
          {!isOnline && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 px-6 py-3 text-xs font-mono flex items-center justify-center gap-2 relative z-50 animate-pulse">
              <span className="text-amber-500">📶</span>
              <span>Dugout Offline Mode active. Matches are loaded from local cache. AI analysis will require internet.</span>
            </div>
          )}
          <Outlet context={{ addToast }} />
        </main>
      </div>
    </div>
  );
}
