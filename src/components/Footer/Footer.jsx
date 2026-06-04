import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Mail, Cpu, ShieldCheck, Trophy } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface1 border-t border-border mt-auto relative z-10">
      {/* How CoachLens Works */}
      <div className="border-b border-border/40 py-5 bg-surface2/20">
        <div className="max-w-7xl mx-auto px-6">
          <h4 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-textTertiary mb-2.5">How CoachLens works</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-textSecondary">
            <div className="flex items-center gap-2.5">
              <Cpu size={14} className="text-accent shrink-0" />
              <span>Powered by Synthetic Leather & Willow — AI trained on grass stains, tea-breaks, and tactical genius</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={14} className="text-aggressor-text shrink-0" />
              <span>Your scorecard is never stored — processed in real time and discarded</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Trophy size={14} className="text-anchor-text shrink-0" />
              <span>Designed for amateur club cricket — formats from Under-12 to Masters</span>
            </div>
          </div>
        </div>
      </div>

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
              <a href="https://x.com/Rahhhul21" target="_blank" rel="noreferrer" className="text-textTertiary hover:text-accent transition-colors"><Twitter size={18} /></a>
              <a href="https://github.com/ShivamGawade-XS" target="_blank" rel="noreferrer" className="text-textTertiary hover:text-accent transition-colors"><Github size={18} /></a>
              <a href="https://www.linkedin.com/in/shivam-gawade-96a94031b" target="_blank" rel="noreferrer" className="text-textTertiary hover:text-accent transition-colors"><Linkedin size={18} /></a>
              <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'shivamgawdenoise@gmail.com'}`} className="text-textTertiary hover:text-accent transition-colors"><Mail size={18} /></a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest mb-4 text-textPrimary">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/analyze" className="text-sm text-textSecondary hover:text-accent transition-colors">Start Analysis</Link></li>
              <li><Link to="/dashboard" className="text-sm text-textSecondary hover:text-accent transition-colors">Dashboard</Link></li>
              <li><Link to="/pricing" className="text-sm text-textSecondary hover:text-accent transition-colors">Pricing</Link></li>
              <li><Link to="/changelog" className="text-sm text-textSecondary hover:text-accent transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest mb-4 text-textPrimary">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/docs" className="text-sm text-textSecondary hover:text-accent transition-colors">Documentation</Link></li>
              <li><Link to="/api" className="text-sm text-textSecondary hover:text-accent transition-colors">API Reference</Link></li>
              <li><Link to="/community" className="text-sm text-textSecondary hover:text-accent transition-colors">Community</Link></li>
              <li><Link to="/blog" className="text-sm text-textSecondary hover:text-accent transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest mb-4 text-textPrimary">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-textSecondary hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="text-sm text-textSecondary hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-textSecondary hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'shivamgawdenoise@gmail.com'}`} className="text-sm text-textSecondary hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-textTertiary font-mono">
            © {new Date().getFullYear()} CoachLens AI. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
