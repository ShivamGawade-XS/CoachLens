import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../Footer/Footer';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { ChevronRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      {/* Global Ambient Background */}
      <div className="ambient-gradient" />

      {/* Public Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link to="/" className="flex items-center shrink-0">
            <img src="/logo.png" alt="CoachLens" className="h-8 md:h-10 object-contain dark:brightness-100 brightness-0" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-sm font-mono text-textSecondary hover:text-textPrimary transition-colors">About</Link>
            <Link to="/features" className="text-sm font-mono text-textSecondary hover:text-textPrimary transition-colors">Features</Link>
            <Link to="/pricing" className="text-sm font-mono text-textSecondary hover:text-textPrimary transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link 
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 bg-accent hover:bg-accentHover text-white px-5 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
              >
                Dashboard <ChevronRight size={16} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="hidden sm:flex items-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-4 py-2 rounded-xl text-sm font-mono font-medium transition-all"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup"
                  className="hidden sm:flex items-center gap-2 bg-accent hover:bg-accentHover text-white px-5 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
                >
                  Get Started <ChevronRight size={16} />
                </Link>
              </>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-textPrimary bg-surface2 rounded-lg border border-border"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass border-b border-border p-6 space-y-4 animate-fade-in">
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-sm font-mono text-textPrimary py-2">About</Link>
            <Link to="/features" onClick={() => setIsMenuOpen(false)} className="block text-sm font-mono text-textPrimary py-2">Features</Link>
            <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="block text-sm font-mono text-textPrimary py-2">Pricing</Link>
            <hr className="border-border" />
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-accent text-white py-3 rounded-xl text-sm font-mono font-bold">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-surface2 text-textPrimary py-3 rounded-xl text-sm font-mono font-bold">Log In</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-accent text-white py-3 rounded-xl text-sm font-mono font-bold">Get Started</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 relative z-10 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
