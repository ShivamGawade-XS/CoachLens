import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Code, Users, BookOpen, Clock, ChevronRight } from 'lucide-react';

const PageWrapper = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-primary pt-16 pb-24 relative overflow-hidden">
    <div className="absolute inset-0 ambient-gradient opacity-50" />
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display text-textPrimary mb-4">{title}</h1>
        {subtitle && <p className="text-lg text-textSecondary font-mono max-w-2xl mx-auto">{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);

export function Features() {
  const features = [
    {
      title: 'AI Scorecard Analysis',
      desc: 'Paste raw scorecard text from CricHeroes and let our LLM engine extract deep tactical insights instantly.',
      icon: <Zap className="text-accent" size={24} />
    },
    {
      title: 'WhatsApp Coach Integration',
      desc: 'Generate 2-sentence personalized feedback messages for every player and send directly to WhatsApp with one click.',
      icon: <CheckCircle className="text-aggressor-text" size={24} />
    },
    {
      title: 'Momentum Visualization',
      desc: 'Visual over-by-over charts that automatically detect turning points and team momentum shifts.',
      icon: <Code className="text-anchor-text" size={24} />
    }
  ];

  return (
    <PageWrapper title="Features" subtitle="Supercharge your coaching with AI intelligence.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="glass-card p-8 rounded-2xl border-t-2 border-accent hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-surface2 rounded-xl flex items-center justify-center mb-6">
              {f.icon}
            </div>
            <h3 className="text-xl font-display text-textPrimary mb-3">{f.title}</h3>
            <p className="text-sm text-textSecondary leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <Link to="/signup" className="inline-flex items-center gap-2 bg-accent hover:bg-accentHover text-white px-6 py-3 rounded-xl font-mono font-bold uppercase tracking-wider transition-all">
          Try it for free <ChevronRight size={18} />
        </Link>
      </div>
    </PageWrapper>
  );
}

export function Pricing() {
  return (
    <PageWrapper title="Simple, Transparent Pricing" subtitle="Start for free. Upgrade when your team needs more power.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-4xl mx-auto">
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-lg font-mono text-textPrimary mb-2 uppercase tracking-widest">Free</h3>
          <div className="text-4xl font-display text-textPrimary mb-6">₹0<span className="text-sm text-textSecondary font-sans">/mo</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-2 text-sm text-textSecondary"><CheckCircle size={16} className="text-accent"/> 5 match analyses per month</li>
            <li className="flex items-center gap-2 text-sm text-textSecondary"><CheckCircle size={16} className="text-accent"/> Basic Momentum Charts</li>
          </ul>
          <Link to="/signup" className="block w-full text-center bg-surface2 hover:bg-surface3 text-textPrimary py-3 rounded-xl font-mono font-bold transition-all">Start Free</Link>
        </div>
        
        <div className="glass-card p-8 rounded-2xl border-2 border-accent relative transform md:-translate-y-4 shadow-glow-amber">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Most Popular</div>
          <h3 className="text-lg font-mono text-textPrimary mb-2 uppercase tracking-widest">Pro Coach</h3>
          <div className="text-4xl font-display text-textPrimary mb-6">₹299<span className="text-sm text-textSecondary font-sans">/mo</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-2 text-sm text-textSecondary"><CheckCircle size={16} className="text-accent"/> Unlimited Match Analyses</li>
            <li className="flex items-center gap-2 text-sm text-textSecondary"><CheckCircle size={16} className="text-accent"/> WhatsApp Integration</li>
            <li className="flex items-center gap-2 text-sm text-textSecondary"><CheckCircle size={16} className="text-accent"/> PDF Exports</li>
          </ul>
          <Link to="/signup" className="block w-full text-center bg-accent hover:bg-accentHover text-white py-3 rounded-xl font-mono font-bold transition-all">Upgrade to Pro</Link>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-lg font-mono text-textPrimary mb-2 uppercase tracking-widest">Academy</h3>
          <div className="text-4xl font-display text-textPrimary mb-6">₹999<span className="text-sm text-textSecondary font-sans">/mo</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-2 text-sm text-textSecondary"><CheckCircle size={16} className="text-accent"/> Unlimited Teams</li>
            <li className="flex items-center gap-2 text-sm text-textSecondary"><CheckCircle size={16} className="text-accent"/> Custom AI Prompts</li>
            <li className="flex items-center gap-2 text-sm text-textSecondary"><CheckCircle size={16} className="text-accent"/> API Access</li>
          </ul>
          <a href="mailto:shivamgawdenoise@gmail.com" className="block w-full text-center bg-surface2 hover:bg-surface3 text-textPrimary py-3 rounded-xl font-mono font-bold transition-all">Contact Sales</a>
        </div>
      </div>
    </PageWrapper>
  );
}

export function Changelog() {
  const updates = [
    { version: "v1.1.0", date: "May 2026", title: "WhatsApp Message Generator", desc: "Added the ability to instantly generate and send personalized 2-sentence coaching feedback to players via WhatsApp." },
    { version: "v1.0.5", date: "May 2026", title: "Momentum Chart Engine Overhaul", desc: "Completely rewrote the regex parsing engine to flawlessly extract over-by-over runs and wickets from any CricHeroes scorecard format." },
    { version: "v1.0.0", date: "April 2026", title: "Initial Hackathon Release", desc: "CoachLens MVP goes live with Llama-3-70B integration for instant match analysis." }
  ];

  return (
    <PageWrapper title="Changelog" subtitle="See what we've been shipping.">
      <div className="max-w-2xl mx-auto space-y-8">
        {updates.map((u, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex gap-6">
            <div className="hidden sm:block shrink-0 pt-1">
              <div className="w-12 h-12 bg-surface2 rounded-xl flex items-center justify-center text-accent">
                <Clock size={20} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-bold bg-surface2 px-2 py-1 rounded text-textPrimary">{u.version}</span>
                <span className="text-xs font-mono text-textTertiary uppercase tracking-wider">{u.date}</span>
              </div>
              <h3 className="text-lg font-display text-textPrimary mb-2">{u.title}</h3>
              <p className="text-sm text-textSecondary leading-relaxed">{u.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}

export function Documentation() {
  return (
    <PageWrapper title="Documentation" subtitle="Learn how to get the most out of CoachLens.">
      <div className="glass-card p-12 rounded-2xl text-center max-w-2xl mx-auto">
        <BookOpen size={48} className="mx-auto text-textTertiary mb-6 opacity-50" />
        <h2 className="text-2xl font-display text-textPrimary mb-4">Documentation Portal</h2>
        <p className="text-textSecondary mb-8">Our comprehensive guides and tutorials are currently being compiled. Check back soon for full documentation on maximizing AI in your coaching workflows.</p>
        <Link to="/dashboard" className="text-accent hover:underline font-mono uppercase tracking-wider text-sm">Return to Dashboard</Link>
      </div>
    </PageWrapper>
  );
}

export function ApiReference() {
  return (
    <PageWrapper title="API Reference" subtitle="Build CoachLens into your own applications.">
      <div className="glass-card p-12 rounded-2xl text-center max-w-2xl mx-auto">
        <Code size={48} className="mx-auto text-textTertiary mb-6 opacity-50" />
        <h2 className="text-2xl font-display text-textPrimary mb-4">Developer API Access</h2>
        <p className="text-textSecondary mb-8">API access is currently in closed beta and restricted to Academy tier subscribers. If you need early access to build integrations, please contact our team.</p>
        <a href="mailto:shivamgawdenoise@gmail.com" className="text-accent hover:underline font-mono uppercase tracking-wider text-sm">Request API Keys</a>
      </div>
    </PageWrapper>
  );
}

export function Community() {
  return (
    <PageWrapper title="Community" subtitle="Join the conversation with other modern coaches.">
      <div className="glass-card p-12 rounded-2xl text-center max-w-2xl mx-auto">
        <Users size={48} className="mx-auto text-textTertiary mb-6 opacity-50" />
        <h2 className="text-2xl font-display text-textPrimary mb-4">CoachLens Community Discord</h2>
        <p className="text-textSecondary mb-8">Connect with other data-driven cricket coaches, share analysis strategies, and suggest new features for our roadmap.</p>
        <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-xl font-mono font-bold uppercase tracking-wider transition-all">
          Join Discord Server
        </button>
      </div>
    </PageWrapper>
  );
}

export function Blog() {
  return (
    <PageWrapper title="CoachLens Blog" subtitle="Insights, updates, and coaching philosophy.">
      <div className="glass-card p-12 rounded-2xl text-center max-w-2xl mx-auto">
        <BookOpen size={48} className="mx-auto text-textTertiary mb-6 opacity-50" />
        <h2 className="text-2xl font-display text-textPrimary mb-4">Coming Soon</h2>
        <p className="text-textSecondary mb-8">We're writing up our first series of articles on the intersection of AI and cricket coaching. Subscribe to our newsletter to be notified when we launch.</p>
        <div className="flex gap-2 max-w-md mx-auto">
          <input type="email" placeholder="coach@team.com" className="flex-1 bg-surface1 border border-border rounded-xl px-4 text-sm text-textPrimary outline-none focus:border-accent" />
          <button className="bg-surface2 hover:bg-surface3 text-textPrimary px-4 py-2 rounded-xl font-mono font-bold text-sm transition-all">Subscribe</button>
        </div>
      </div>
    </PageWrapper>
  );
}
