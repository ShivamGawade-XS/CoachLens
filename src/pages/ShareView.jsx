import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import PlayerCard from '../components/PlayerCard/PlayerCard';

export default function ShareView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playerNameParam = searchParams.get('player');
    if (!playerNameParam) {
      setError('No player name specified in the URL.');
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/share/${id}`);
        if (!response.ok) {
          throw new Error('Analysis not found or expired.');
        }
        const data = await response.json();

        if (!data || !data.players) {
          throw new Error('Invalid analysis data returned.');
        }

        const rawPlayer = data.players.find(
          p => p.name.toLowerCase() === playerNameParam.toLowerCase()
        );

        if (!rawPlayer) {
          throw new Error(`Player "${playerNameParam}" not found in this match analysis.`);
        }

        const mappedPlayer = {
          name: rawPlayer.name,
          role: rawPlayer.role,
          tag: rawPlayer.tag,
          key_stat: rawPlayer.key_stat || rawPlayer.position,
          match_impact: rawPlayer.match_impact || "8",
          what_worked: rawPlayer.what_worked || rawPlayer.whatWorked,
          what_failed: rawPlayer.what_failed || rawPlayer.whatFailed,
          next_match_instruction: rawPlayer.next_match_instruction || rawPlayer.nextMatch,
          practice_drill: rawPlayer.practice_drill || rawPlayer.drill
        };

        setPlayer(mappedPlayer);
      } catch (err) {
        console.error('Failed to load shareable card:', err);
        setError(err.message || 'Failed to load player card.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, searchParams]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Ambient background */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-aggressor-bg/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="CoachLens" className="h-10 mx-auto object-contain dark:brightness-100 brightness-0" />
          </Link>
          <p className="text-textSecondary text-xs font-mono mt-3 uppercase tracking-widest">
            AI Coaching Intelligence
          </p>
        </div>

        {error ? (
          <div className="glass-card rounded-2xl p-8 border border-border w-full text-center">
            <div className="w-12 h-12 rounded-full bg-liability-bg/50 border border-liability-border flex items-center justify-center mx-auto mb-4 text-liability-text">
              <AlertCircle size={20} />
            </div>
            <h2 className="text-lg font-display text-textPrimary mb-2">Oops!</h2>
            <p className="text-sm text-textSecondary mb-6">{error}</p>
            <Link to="/" className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white px-6 py-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber">
              Go to Homepage
            </Link>
          </div>
        ) : loading ? (
          <div className="glass-card rounded-2xl p-12 border border-border w-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
          </div>
        ) : (
          <div className="w-full relative shadow-card">
            {/* The Player Card itself */}
            <PlayerCard player={player} hideActions={true} />
            
            {/* Growth CTA */}
            <div className="mt-8 text-center bg-surface2/50 backdrop-blur-sm border border-border p-6 rounded-2xl">
              <h4 className="text-sm font-display text-textPrimary mb-1">Want analysis like this for your team?</h4>
              <p className="text-xs text-textSecondary mb-4">CoachLens generates AI performance insights from any scorecard in 30 seconds.</p>
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-surface3 hover:bg-border text-textPrimary px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all border border-border/50 hover:border-textTertiary group">
                Create Free Account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
