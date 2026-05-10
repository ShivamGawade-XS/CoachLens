import React from 'react';

const PageWrapper = ({ title, children }) => (
  <div className="min-h-screen bg-primary pt-16 pb-24">
    <div className="max-w-3xl mx-auto px-6">
      <h1 className="text-4xl font-display text-textPrimary mb-8">{title}</h1>
      <div className="prose prose-invert prose-slate max-w-none">
        <div className="glass-card p-8 rounded-2xl text-textSecondary leading-relaxed space-y-6">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export function About() {
  return (
    <PageWrapper title="About CoachLens">
      <h2 className="text-textPrimary font-mono font-bold text-lg">Our Mission</h2>
      <p>CoachLens was built to democratize sports analytics. We believe that amateur and semi-pro cricket coaches deserve the same level of tactical intelligence as international teams, without needing a dedicated data analyst.</p>
      
      <h2 className="text-textPrimary font-mono font-bold text-lg mt-8">The Technology</h2>
      <p>Powered by the Groq API and LLM-based pattern recognition, CoachLens ingests unstructured scorecard data (like text copied from CricHeroes) and transforms it into structured, actionable coaching decisions.</p>

      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-textPrimary font-mono font-bold text-lg mb-4">Contact Us</h2>
        <p className="mb-2">Built with ❤️ by <strong className="text-accent">Crimson Syndicate</strong></p>
        <p className="flex items-center gap-2 text-sm"><span className="font-mono">📞</span> 8459810402</p>
        <p className="flex items-center gap-2 text-sm mt-1"><span className="font-mono">✉️</span> <a href="mailto:shivamgawdenoise@gmail.com" className="text-accent hover:underline">shivamgawdenoise@gmail.com</a></p>
      </div>
    </PageWrapper>
  );
}

export function PrivacyPolicy() {
  return (
    <PageWrapper title="Privacy Policy">
      <p className="text-xs font-mono uppercase tracking-widest text-textTertiary mb-4">Last Updated: May 2026</p>
      <p>This is a demonstration application. All scorecards analyzed are processed via third-party language models. Please do not upload sensitive or personally identifiable information.</p>
      <p>Match data is currently stored locally in your browser using `localStorage`. We do not track, sell, or monitor your individual team performance data.</p>
    </PageWrapper>
  );
}

export function TermsOfService() {
  return (
    <PageWrapper title="Terms of Service">
      <p className="text-xs font-mono uppercase tracking-widest text-textTertiary mb-4">Last Updated: May 2026</p>
      <p>By using CoachLens, you agree that the AI-generated coaching briefs are suggestions based on statistical patterns. CoachLens is not responsible for any match outcomes, lost tournaments, or angry players resulting from following these AI recommendations.</p>
      <p>Use your own judgment as a coach. The AI is your assistant, not your replacement.</p>
    </PageWrapper>
  );
}
