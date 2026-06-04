import React from 'react';

/**
 * Simple hash function to derive a deterministic color from a string.
 * Returns an HSL color with fixed saturation/lightness for the dark theme.
 */
const getColorFromName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32-bit int
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
};

/**
 * Extract up to 2 initials from a player name.
 */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

/**
 * AvatarInitials — Circular avatar showing initials with a name-derived color.
 * Used when a player has no profile picture.
 *
 * @param {string}  name       — Player name to derive initials + color from
 * @param {string}  size       — Tailwind size class (default: 'w-16 h-16')
 * @param {string}  textSize   — Tailwind text size class (default: 'text-lg')
 * @param {string}  className  — Additional classes
 */
export default function AvatarInitials({ name = '', size = 'w-16 h-16', textSize = 'text-lg', className = '' }) {
  const bgColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center font-mono font-bold ${textSize} text-white shrink-0 select-none ${className}`}
      style={{ backgroundColor: bgColor }}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
}
