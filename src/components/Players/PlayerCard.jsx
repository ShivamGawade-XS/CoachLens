import React from 'react';
import AvatarInitials from './AvatarInitials';

const ROLE_BADGE = {
  'Batsman':        'bg-anchor-bg text-anchor-text border-anchor-border',
  'Bowler':         'bg-aggressor-bg text-aggressor-text border-aggressor-border',
  'All-Rounder':    'bg-[#2e1065]/60 text-purple-300 border-purple-500/40',
  'Wicket-Keeper':  'bg-improving-bg text-improving-text border-improving-border',
};

/**
 * PlayerCard — Grid card for the Players List screen.
 * Shows profile picture (or initials), name, jersey number, role badge, and batting style.
 */
export default function PlayerCard({ player, onClick }) {
  const {
    name,
    jerseyNumber,
    role,
    battingStyle,
    profilePicture,
  } = player;

  return (
    <div
      onClick={onClick}
      className="group glass-card rounded-2xl p-5 cursor-pointer card-interactive flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Profile Picture / Avatar */}
      <div className="relative mb-4">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-border group-hover:border-accent transition-colors"
          />
        ) : (
          <AvatarInitials
            name={name}
            size="w-20 h-20"
            textSize="text-xl"
            className="border-2 border-border group-hover:border-accent transition-colors"
          />
        )}

        {/* Jersey Number Badge */}
        {jerseyNumber != null && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface1 border-2 border-border flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-textPrimary">
              {jerseyNumber}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-sm font-display text-textPrimary group-hover:text-accent transition-colors truncate w-full mb-1.5">
        {name}
      </h3>

      {/* Role Badge */}
      <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border mb-2 ${ROLE_BADGE[role] || 'bg-surface2 text-textTertiary border-border'}`}>
        {role}
      </span>

      {/* Batting Style */}
      <p className="text-[10px] font-mono text-textTertiary uppercase tracking-wider">
        {battingStyle || 'Right Hand'} Bat
      </p>
    </div>
  );
}
