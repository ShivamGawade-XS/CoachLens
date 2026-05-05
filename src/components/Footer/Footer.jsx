import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface1 border-t border-border mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src="/logo.png" alt="CoachLens" className="h-8 object-contain dark:brightness-100 brightness-0" />
            </Link>
            <p className="text-sm text-textSecondary mb-6 leading-relaxed max-w-sm">
              AI-powered cricket intelligence. Turn raw scorecards into actionable coaching briefs in seconds.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-textTertiary hover:text-accent transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-textTertiary hover:text-accent transition-colors"><Github size={18} /></a>
              <a href="#" className="text-textTertiary hover:text-accent transition-colors"><Linkedin size={18} /></a>
              <a href="#" className="text-textTertiary hover:text-accent transition-colors"><Mail size={18} /></a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest mb-4 text-textPrimary">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/analyze" className="text-sm text-textSecondary hover:text-accent transition-colors">Start Analysis</Link></li>
              <li><Link to="/dashboard" className="text-sm text-textSecondary hover:text-accent transition-colors">Dashboard</Link></li>
              <li><a href="#" className="text-sm text-textSecondary hover:text-accent transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-textSecondary hover:text-accent transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest mb-4 text-textPrimary">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-textSecondary hover:text-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-textSecondary hover:text-accent transition-colors">API Reference</a></li>
              <li><a href="#" className="text-sm text-textSecondary hover:text-accent transition-colors">Community</a></li>
              <li><a href="#" className="text-sm text-textSecondary hover:text-accent transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest mb-4 text-textPrimary">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-textSecondary hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="text-sm text-textSecondary hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-textSecondary hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><a href="#" className="text-sm text-textSecondary hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-textTertiary font-mono">
            © {new Date().getFullYear()} CoachLens AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-aggressor-border animate-pulse"></span>
            <span className="text-xs text-textTertiary font-mono">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
