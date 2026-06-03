import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Target, Shield, ArrowRight, ChevronDown } from 'lucide-react';

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className="bg-surface1 border border-border shadow-sm p-6 rounded-2xl cursor-pointer hover:shadow-md transition-all"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-display text-textPrimary flex items-start gap-3 mb-0">
          <span className="text-accent mt-1">Q.</span>
          {question}
        </h3>
        <ChevronDown 
          className={`text-textSecondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </div>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-sm text-textSecondary leading-relaxed pl-8">
          {answer}
        </p>
      </div>
    </div>
  );
}

const PARTNERS = [
  { name: 'Emirates', logoUrl: '/logos/emirates.svg' },
  { name: 'Aramco', logoUrl: '/logos/aramco.svg' },
  { name: 'DP World', logoUrl: '/logos/dpworld.svg' },
  { name: 'Hyundai', logoUrl: '/logos/hyundai.svg' },
  { name: 'Coca-Cola', logoUrl: '/logos/cocacola.svg' },
  { name: 'Booking.com', logoUrl: '/logos/booking.svg' },
  { name: 'MRF', logoUrl: '/logos/mrf.svg' },
  { name: 'IndusInd Bank', logoUrl: '/logos/indusind.svg' },
  { name: 'Google', logoUrl: '/logos/google.svg' },
];

function PartnersMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  
  // Duplicate list to create infinite loop effect
  const doublePartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="py-12 bg-surface1 border-t border-border overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
        <span className="text-[10px] uppercase tracking-widest font-mono text-textTertiary font-semibold bg-surface2 px-3 py-1 rounded-full border border-border">
          Intelligence Partners & Sponsors
        </span>
      </div>

      <div 
        className="relative w-full overflow-hidden flex items-center py-4 bg-surface2/20"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradients to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

        <div className={`flex items-center gap-16 animate-marquee ${isPaused ? 'animate-marquee-paused' : ''}`}>
          {doublePartners.map((p, idx) => {
            return (
              <div 
                key={`${p.name}-${idx}`} 
                className="flex items-center justify-center shrink-0 w-28 md:w-36 h-10 hover:scale-110 transition-all duration-300 cursor-pointer"
                title={p.name}
              >
                <img 
                  src={p.logoUrl} 
                  alt={`${p.name} logo`}
                  className="h-full max-h-8 md:max-h-10 w-auto object-contain grayscale opacity-45 dark:opacity-35 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

          
          <h1 className="text-5xl md:text-7xl font-display text-textPrimary leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '100ms', fontSize: 'clamp(28px, 6vw, 56px)' }}>
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

          {/* Slim Trust Bar */}
          <div className="mt-14 w-full max-w-4xl mx-auto bg-surface1 dark:bg-[#1A1D24] border border-border/60 dark:border-border/40 shadow-sm dark:shadow-none rounded-xl px-5 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-textSecondary animate-fade-in-up max-h-[160px] md:max-h-[60px] overflow-hidden trust-bar-mobile" style={{ animationDelay: '400ms' }}>
            {/* 1. Scorecards Analysed */}
            <div className="flex items-center gap-2 shrink-0">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
              <span><strong className="text-textPrimary font-semibold font-mono">2,400+</strong> scorecards analysed</span>
            </div>

            <div className="hidden md:block h-5 w-[1px] bg-border/20" />

            {/* 2. Testimonial Pull-quote */}
            <div className="flex items-center gap-2 text-left max-w-[320px]">
              <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[9px] font-mono font-bold text-accent shrink-0 select-none">
                MD
              </div>
              <p className="line-clamp-2 leading-tight italic text-textSecondary">
                "Saved me hours of post-match work." <span className="font-sans font-semibold not-italic text-textPrimary text-[10px]">— Davis (Wanderers CC)</span>
              </p>
            </div>

            <div className="hidden md:block h-5 w-[1px] bg-border/20" />

            {/* 3. Works With CricHQ/ESPNcricinfo/WhatsApp */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span>Works with:</span>
              <div className="flex gap-1">
                <span className="bg-surface2 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border border-border/30 text-textPrimary leading-none">CricHQ</span>
                <span className="bg-surface2 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border border-border/30 text-textPrimary leading-none">ESPN</span>
                <span className="bg-surface2 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border border-border/30 text-textPrimary leading-none">WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Marquee */}
      <PartnersMarquee />

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface2/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display text-textPrimary mb-4">How CoachLens works</h2>
            <p className="text-textSecondary font-mono max-w-2xl mx-auto">Stop reading stats. Start making decisions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface1 border border-border p-8 rounded-2xl group hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-aggressor-bg/50 border border-aggressor-border flex items-center justify-center text-aggressor-text mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-display text-textPrimary mb-3">Player Cards</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Automatically categorizes players as Aggressors, Anchors, or Liabilities with individualized practice drills.
              </p>
            </div>

            <div className="bg-surface1 border border-border p-8 rounded-2xl group hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-anchor-bg/50 border border-anchor-border flex items-center justify-center text-anchor-text mb-6 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-display text-textPrimary mb-3">Team Reports</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Identifies match turning points, strongest partnerships, and bowling inefficiencies instantly.
              </p>
            </div>

            <div className="bg-surface1 border border-border p-8 rounded-2xl group hover:shadow-md transition-all duration-300">
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
            <FAQItem 
              question="Does this work with CricHeroes?"
              answer="Yes! Just open your match scorecard on the CricHeroes app or website, copy the text, and paste it directly into CoachLens. Our AI automatically parses the raw text into structured data."
            />
            <FAQItem 
              question="How is this different from CricHeroes?"
              answer="CricHeroes is a scoreboard — it tells you *what* happened. CoachLens is an intelligence layer — it tells you *why* you lost and *what to do next*. We don't replace CricHeroes, we sit on top of it."
            />
            <FAQItem 
              question="Can I share the feedback with my players?"
              answer="Yes. Every player card has a &quot;Share&quot; button that instantly generates a 2-sentence personalised feedback message and opens it in WhatsApp, ready to send to that individual player."
            />
            <FAQItem 
              question="Is CoachLens free?"
              answer="Our base tier is 100% free forever and includes 5 full match analyses per month. For unlimited matches and advanced features, you can upgrade to the Pro Coach tier."
            />
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
