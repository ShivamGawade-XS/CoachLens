import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../Footer/Footer';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { ChevronRight } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      {/* Global Ambient Background */}
      <div className="ambient-gradient" />

      {/* Public Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="CoachLens" className="h-8 md:h-10 object-contain dark:brightness-100 brightness-0" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-sm font-mono text-textSecondary hover:text-textPrimary transition-colors">About</Link>
            <a href="#features" className="text-sm font-mono text-textSecondary hover:text-textPrimary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-mono text-textSecondary hover:text-textPrimary transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              to="/dashboard"
              className="hidden md:flex items-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-4 py-2 rounded-xl text-sm font-mono font-medium transition-all"
            >
              Log In
            </Link>
            <Link 
              to="/analyze"
              className="flex items-center gap-2 bg-accent hover:bg-accentHover text-white px-5 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
            >
              Get Started <ChevronRight size={16} />
            </Link>
          </div>
        </div>
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
