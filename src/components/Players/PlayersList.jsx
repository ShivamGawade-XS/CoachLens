import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { getAllPlayers, savePlayer, searchPlayers, seedDemoPlayers } from '../../services/playerService';
import PlayerCardItem from './PlayerCard';
import PlayerModal from './PlayerModal';

export default function PlayersList() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadPlayers = useCallback(() => {
    const results = searchQuery.trim()
      ? searchPlayers(searchQuery)
      : getAllPlayers();
    setPlayers(results);
  }, [searchQuery]);

  // Seed demo players on first visit (idempotent) and load
  useEffect(() => {
    const demoMatchIds = [
      'demo-panaji_vs_margao', 'demo-margao_vs_vasco', 'demo-vasco_vs_ponda',
      'demo-panaji_vs_vasco', 'demo-panaji_vs_ponda'
    ];
    seedDemoPlayers(demoMatchIds);
    loadPlayers();
  }, [loadPlayers]);

  const handleSavePlayer = (playerData) => {
    savePlayer(playerData);
    setShowModal(false);
    loadPlayers();
  };

  const handleCardClick = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-xl font-display text-textPrimary mb-1">Player Profiles</h1>
          <p className="text-textSecondary text-sm font-mono">
            {players.length} player{players.length !== 1 ? 's' : ''} in your roster
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white px-6 py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
        >
          <Plus size={16} /> Add Player
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textTertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players by name..."
          className="w-full bg-surface2 border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent transition-colors font-mono"
        />
      </div>

      {/* Players Grid or Empty State */}
      {players.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface2 border border-border flex items-center justify-center mx-auto mb-4 text-textTertiary">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-display text-textPrimary mb-2">
            {searchQuery ? 'No players found' : 'No players yet'}
          </h3>
          <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto">
            {searchQuery
              ? `No players matching "${searchQuery}". Try a different search.`
              : 'Add your first player to start building your squad roster.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-surface2 hover:bg-surface3 border border-border text-textPrimary px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all btn-press"
            >
              Add First Player
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
            >
              <PlayerCardItem
                player={player}
                onClick={() => handleCardClick(player.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add Player Modal */}
      {showModal && (
        <PlayerModal
          onSave={handleSavePlayer}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
