import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Target, Shield, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            CoachLens 2.0 is Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display text-textPrimary leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Turn raw scorecards into<br />
            <span className="text-gradient-amber">match-winning intelligence.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-textSecondary max-w-2xl mx-auto mb-10 leading-relaxed font-mono animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Paste your CricHeroes scorecard. Get an AI-generated coaching brief, player report cards, and tactical breakdowns in exactly 30 seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link 
              to="/signup"
              className="w-full sm:w-auto bg-accent hover:bg-accentHover text-white px-8 py-4 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-8 py-4 rounded-xl text-sm font-mono font-medium transition-all text-center"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface2/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display text-textPrimary mb-4">How CoachLens works</h2>
            <p className="text-textSecondary font-mono max-w-2xl mx-auto">Stop reading stats. Start making decisions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-aggressor-bg/50 border border-aggressor-border flex items-center justify-center text-aggressor-text mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-display text-textPrimary mb-3">Player Cards</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Automatically categorizes players as Aggressors, Anchors, or Liabilities with individualized practice drills.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-anchor-bg/50 border border-anchor-border flex items-center justify-center text-anchor-text mb-6 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-display text-textPrimary mb-3">Team Reports</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Identifies match turning points, strongest partnerships, and bowling inefficiencies instantly.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl group">
              <div className="w-12 h-12 rounded-xl bg-improving-bg/50 border border-improving-border flex items-center justify-center text-improving-text mb-6 group-hover:scale-110 transition-transform">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-display text-textPrimary mb-3">Tactical Briefs</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Generates a printable PDF brief with batting order changes and tactical focus areas for the next match.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-primary border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display text-textPrimary mb-4">Frequently Asked Questions</h2>
            <p className="text-textSecondary font-mono max-w-2xl mx-auto">Everything you need to know about CoachLens.</p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-display text-textPrimary mb-2 flex items-start gap-3">
                <span className="text-accent mt-1">Q.</span>
                Does this work with CricHeroes?
              </h3>
              <p className="text-sm text-textSecondary leading-relaxed pl-8">
                Yes! Just open your match scorecard on the CricHeroes app or website, copy the text, and paste it directly into CoachLens. Our AI automatically parses the raw text into structured data.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-display text-textPrimary mb-2 flex items-start gap-3">
                <span className="text-accent mt-1">Q.</span>
                How is this different from CricHeroes?
              </h3>
              <p className="text-sm text-textSecondary leading-relaxed pl-8">
                CricHeroes is a scoreboard — it tells you *what* happened. CoachLens is an intelligence layer — it tells you *why* you lost and *what to do next*. We don't replace CricHeroes, we sit on top of it.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-display text-textPrimary mb-2 flex items-start gap-3">
                <span className="text-accent mt-1">Q.</span>
                Can I share the feedback with my players?
              </h3>
              <p className="text-sm text-textSecondary leading-relaxed pl-8">
                Yes. Every player card has a "Share" button that instantly generates a 2-sentence personalised feedback message and opens it in WhatsApp, ready to send to that individual player.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-display text-textPrimary mb-2 flex items-start gap-3">
                <span className="text-accent mt-1">Q.</span>
                Is CoachLens free?
              </h3>
              <p className="text-sm text-textSecondary leading-relaxed pl-8">
                Our base tier is 100% free forever and includes 5 full match analyses per month. For unlimited matches and advanced features, you can upgrade to the Pro Coach tier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-display text-textPrimary mb-6">Ready to upgrade your coaching?</h2>
          <p className="text-textSecondary mb-10 font-mono">No credit card required. Try it on your last match scorecard right now.</p>
          <Link 
            to="/signup"
            className="inline-flex bg-accent hover:bg-accentHover text-white px-10 py-5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press items-center gap-2"
          >
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
