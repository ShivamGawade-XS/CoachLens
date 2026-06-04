import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Trash2, User, Shield, Calendar,
  Phone, FileText, Activity, History, AlertCircle
} from 'lucide-react';
import { getPlayerById, savePlayer, deletePlayer } from '../../services/playerService';
import { storageService } from '../../services/storageService';
import AvatarInitials from './AvatarInitials';
import PlayerModal from './PlayerModal';

const ROLE_BADGE = {
  'Batsman':        'bg-anchor-bg text-anchor-text border-anchor-border',
  'Bowler':         'bg-aggressor-bg text-aggressor-text border-aggressor-border',
  'All-Rounder':    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/40',
  'Wicket-Keeper':  'bg-improving-bg text-improving-text border-improving-border',
};

const TAG_COLORS = {
  Aggressor: 'bg-aggressor-bg text-aggressor-text border-aggressor-border',
  Anchor:    'bg-anchor-bg text-anchor-text border-anchor-border',
  Improving: 'bg-improving-bg text-improving-text border-improving-border',
  Liability: 'bg-liability-bg text-liability-text border-liability-border',
};

export default function PlayerDetail() {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const p = getPlayerById(playerId);
    setPlayer(p);

    if (p) {
      const allMatches = await storageService.getMatches();
      // Find matches where this player's name appears in the analysis
      const playerName = p.name.trim().toLowerCase();
      const linkedMatches = [];

      allMatches.forEach((match) => {
        if (!match.analysis?.players) return;
        const found = match.analysis.players.find(
          (ap) => ap.name?.trim().toLowerCase() === playerName
        );
        if (found) {
          linkedMatches.push({
            matchId: match.id,
            date: match.date,
            teamName: match.teamName,
            opponent: match.opponent,
            result: match.result,
            tag: found.tag,
            whatWorked: found.what_worked,
            role: found.role,
          });
        }
      });

      linkedMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMatches(linkedMatches);
    }

    setLoading(false);
  }, [playerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stats summary from linked analyses
  const stats = useMemo(() => {
    if (matches.length === 0) return null;

    const tagCounts = {};
    matches.forEach((m) => {
      if (m.tag) tagCounts[m.tag] = (tagCounts[m.tag] || 0) + 1;
    });

    const mostCommonTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const lastAnalysisDate = matches[0]?.date || null;

    return {
      totalMatches: matches.length,
      mostCommonTag,
      lastAnalysisDate,
    };
  }, [matches]);

  const handleEditSave = (playerData) => {
    savePlayer(playerData);
    setShowEditModal(false);
    loadData();
  };

  const handleDelete = () => {
    deletePlayer(playerId);
    navigate('/players', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
        <div className="glass-card rounded-2xl p-12 text-center">
          <User size={32} className="mx-auto mb-4 text-textTertiary" />
          <h3 className="text-lg font-display text-textPrimary mb-2">Player Not Found</h3>
          <p className="text-textSecondary text-sm mb-6">This player profile doesn&apos;t exist or was deleted.</p>
          <button onClick={() => navigate('/players')} className="bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all btn-press">
            Back to Players
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/players')}
            className="p-2 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-textSecondary hover:text-textPrimary transition-all mt-1"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-5">
            {/* Profile Picture */}
            <div className="relative shrink-0">
              {player.profilePicture ? (
                <img
                  src={player.profilePicture}
                  alt={player.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <AvatarInitials
                  name={player.name}
                  size="w-20 h-20 md:w-24 md:h-24"
                  textSize="text-2xl"
                  className="border-2 border-border"
                />
              )}
              {player.jerseyNumber != null && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface1 border-2 border-border flex items-center justify-center">
                  <span className="text-[11px] font-mono font-bold text-textPrimary">
                    {player.jerseyNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Name & Role */}
            <div>
              <h1 className="text-display-lg md:text-display-xl font-display text-textPrimary mb-1">
                {player.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border ${ROLE_BADGE[player.role] || 'bg-surface2 text-textTertiary border-border'}`}>
                  {player.role}
                </span>
                <span className="text-xs font-mono text-textSecondary">
                  {player.battingStyle} Bat
                </span>
                {player.bowlingStyle && player.bowlingStyle !== 'Does Not Bowl' && (
                  <span className="text-xs font-mono text-textTertiary">
                    • {player.bowlingStyle}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center justify-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-5 py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all btn-press"
        >
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {player.age && (
          <div className="glass-card p-4 rounded-2xl">
            <div className="text-[10px] text-textTertiary uppercase font-mono mb-1 flex items-center gap-1">
              <Calendar size={11} /> Age
            </div>
            <div className="text-xl font-display text-textPrimary">{player.age}</div>
          </div>
        )}
        {player.phone && (
          <div className="glass-card p-4 rounded-2xl">
            <div className="text-[10px] text-textTertiary uppercase font-mono mb-1 flex items-center gap-1">
              <Phone size={11} /> Phone
            </div>
            <div className="text-sm font-mono text-textPrimary truncate">{player.phone}</div>
          </div>
        )}
        <div className="glass-card p-4 rounded-2xl">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-1 flex items-center gap-1">
            <Activity size={11} /> Matches
          </div>
          <div className="text-xl font-display text-textPrimary">{stats?.totalMatches || 0}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="text-[10px] text-textTertiary uppercase font-mono mb-1 flex items-center gap-1">
            <Shield size={11} /> Form
          </div>
          {stats?.mostCommonTag ? (
            <span className={`inline-block px-3 py-1 mt-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border ${TAG_COLORS[stats.mostCommonTag] || 'bg-surface2 text-textTertiary border-border'}`}>
              {stats.mostCommonTag}
            </span>
          ) : (
            <div className="text-sm font-mono text-textTertiary">No data</div>
          )}
        </div>
      </div>

      {/* Coach Notes */}
      {player.notes && (
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-[10px] text-textTertiary uppercase font-mono tracking-widest mb-2 flex items-center gap-1">
            <FileText size={11} /> Coach Notes
          </div>
          <p className="text-sm text-textSecondary leading-relaxed whitespace-pre-wrap">{player.notes}</p>
        </div>
      )}

      {/* Match History */}
      <div>
        <h2 className="text-[12px] text-textSecondary uppercase tracking-[0.2em] flex items-center gap-2 font-medium mb-4">
          <History size={12} /> Analysis History
        </h2>

        {matches.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border-dashed border-border">
            <p className="text-sm text-textSecondary font-mono">
              No match analyses linked to {player.name} yet. Analyses are auto-linked when the player name appears in a scorecard.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link
                key={match.matchId}
                to={`/match/${match.matchId}`}
                className="block glass-card rounded-xl p-5 hover:border-accent/30 transition-all group relative overflow-hidden"
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  match.tag && TAG_COLORS[match.tag]
                    ? TAG_COLORS[match.tag].split(' ')[1]
                    : 'bg-surface3'
                }`} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pl-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-display text-textPrimary group-hover:text-accent transition-colors truncate">
                        {match.teamName || 'Match'} vs {match.opponent || 'Unknown'}
                      </h3>
                      {match.result && (
                        <span className={`shrink-0 text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${
                          match.result === 'Won'
                            ? 'bg-aggressor-bg text-aggressor-text border-aggressor-border'
                            : 'bg-liability-bg text-liability-text border-liability-border'
                        }`}>
                          {match.result}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-textTertiary">
                      {new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {match.whatWorked && (
                      <p className="text-xs text-textSecondary mt-2 line-clamp-1">
                        ✓ {match.whatWorked}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {match.tag && (
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border ${TAG_COLORS[match.tag] || 'bg-surface2 text-textTertiary border-border'}`}>
                        {match.tag}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Delete Button */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 text-sm font-mono text-liability-text hover:bg-liability-bg/20 px-4 py-2.5 rounded-xl transition-colors"
        >
          <Trash2 size={14} /> Delete Player
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-primary/70 backdrop-blur-sm" />
          <div
            className="relative modal-card rounded-2xl p-6 max-w-sm w-full animate-scale-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-liability-bg/30 border border-liability-border">
                <AlertCircle size={18} className="text-liability-text" />
              </div>
              <h3 className="text-lg font-display text-textPrimary">Delete Player</h3>
            </div>
            <p className="text-sm text-textSecondary mb-6">
              Are you sure you want to delete <strong className="text-textPrimary">{player.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-surface2 border border-border text-textSecondary font-mono text-sm font-bold uppercase tracking-wider hover:bg-surface3 transition-colors btn-press"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-liability-bg border border-liability-border text-liability-text font-mono text-sm font-bold uppercase tracking-wider hover:bg-liability-bg/80 transition-colors btn-press"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <PlayerModal
          player={player}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
