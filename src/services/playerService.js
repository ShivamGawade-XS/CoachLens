/**
 * playerService.js — CRUD operations for Player Profiles
 * Storage key: "coachlens_players"
 * All data is persisted in localStorage (base64 images included).
 */

const STORAGE_KEY = 'coachlens_players';

/**
 * Generate a UUID (uses crypto.randomUUID where available, fallback for older browsers).
 */
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Read all players from localStorage.
 * @returns {Array} Array of player objects.
 */
const _readPlayers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('[playerService] Failed to read players:', e);
    return [];
  }
};

/**
 * Write the full players array to localStorage.
 * @param {Array} players
 */
const _writePlayers = (players) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (e) {
    console.error('[playerService] Failed to write players:', e);
  }
};

/**
 * Get all players, sorted by createdAt descending (newest first).
 * @returns {Array}
 */
export const getAllPlayers = () => {
  const players = _readPlayers();
  return players.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Get a single player by ID.
 * @param {string} id
 * @returns {Object|null}
 */
export const getPlayerById = (id) => {
  const players = _readPlayers();
  return players.find((p) => p.id === id) || null;
};

/**
 * Save a player — handles both create (no id) and update (has id).
 * @param {Object} playerData
 * @returns {Object} The saved player object.
 */
export const savePlayer = (playerData) => {
  const players = _readPlayers();
  const isUpdate = playerData.id && players.some((p) => p.id === playerData.id);

  if (isUpdate) {
    // Update existing
    const idx = players.findIndex((p) => p.id === playerData.id);
    players[idx] = {
      ...players[idx],
      ...playerData,
      // Preserve original createdAt and linkedAnalyses
      createdAt: players[idx].createdAt,
      linkedAnalyses: playerData.linkedAnalyses || players[idx].linkedAnalyses || [],
    };
    _writePlayers(players);
    return players[idx];
  } else {
    // Create new
    const newPlayer = {
      id: generateId(),
      name: playerData.name?.trim() || 'Unnamed Player',
      jerseyNumber: playerData.jerseyNumber ?? null,
      role: playerData.role || 'Batsman',
      battingStyle: playerData.battingStyle || 'Right Hand',
      bowlingStyle: playerData.bowlingStyle || 'Does Not Bowl',
      age: playerData.age ?? null,
      phone: playerData.phone || '',
      notes: playerData.notes || '',
      profilePicture: playerData.profilePicture || null,
      createdAt: new Date().toISOString(),
      linkedAnalyses: [],
    };
    players.unshift(newPlayer);
    _writePlayers(players);
    return newPlayer;
  }
};

/**
 * Delete a player by ID.
 * @param {string} id
 * @returns {boolean}
 */
export const deletePlayer = (id) => {
  const players = _readPlayers();
  const filtered = players.filter((p) => p.id !== id);
  if (filtered.length === players.length) return false; // not found
  _writePlayers(filtered);
  return true;
};

/**
 * Link an analysis ID to every player whose name matches (case-insensitive, trimmed).
 * Called from storageService.saveMatch after an analysis is saved.
 * @param {string} playerName — Name from the analysis JSON
 * @param {string} analysisId — Match/analysis ID
 * @returns {boolean} true if any player was linked
 */
export const linkAnalysisToPlayer = (playerName, analysisId) => {
  if (!playerName || !analysisId) return false;

  const players = _readPlayers();
  const normalizedName = playerName.trim().toLowerCase();
  let linked = false;

  players.forEach((player) => {
    if (player.name.trim().toLowerCase() === normalizedName) {
      if (!player.linkedAnalyses) player.linkedAnalyses = [];
      if (!player.linkedAnalyses.includes(analysisId)) {
        player.linkedAnalyses.push(analysisId);
        linked = true;
      }
    }
  });

  if (linked) _writePlayers(players);
  return linked;
};

/**
 * Bulk-link all player names from an analysis to their profiles.
 * Convenience wrapper called once after saving a match.
 * @param {Array} playerNames — Array of player name strings from analysis.players
 * @param {string} analysisId
 */
export const linkAllPlayersFromAnalysis = (playerNames, analysisId) => {
  if (!Array.isArray(playerNames) || !analysisId) return;
  playerNames.forEach((name) => linkAnalysisToPlayer(name, analysisId));
};

/**
 * Search players by name (case-insensitive, partial match).
 * @param {string} query
 * @returns {Array}
 */
export const searchPlayers = (query) => {
  if (!query || !query.trim()) return getAllPlayers();
  const q = query.trim().toLowerCase();
  return getAllPlayers().filter((p) => p.name.toLowerCase().includes(q));
};

// ── SVG Avatar Generator (compact data URIs for demo profiles) ──────────────

/**
 * Generate a small SVG portrait data-URI for a demo player.
 * Each SVG is ~600 bytes — much lighter than raster base64.
 * @param {string} name — Player name (used for color derivation)
 * @param {number} jerseyNumber
 * @param {string} accentHue — HSL hue override (optional)
 * @returns {string} data:image/svg+xml base64 string
 */
const _generateSvgAvatar = (name, jerseyNumber, accentHue) => {
  // Derive hue from name if not provided
  let hue = accentHue;
  if (hue == null) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hue = Math.abs(hash) % 360;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue},60%,25%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360},50%,15%)"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.5">
      <stop offset="0%" stop-color="hsl(${hue},70%,50%)" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#bg)"/>
  <circle cx="100" cy="200" r="100" fill="url(#glow)"/>
  <circle cx="100" cy="75" r="35" fill="hsl(${hue},30%,70%)"/>
  <ellipse cx="100" cy="165" rx="50" ry="55" fill="hsl(${hue},40%,45%)"/>
  <rect x="75" y="130" width="50" height="30" rx="5" fill="hsl(${hue},50%,35%)"/>
  <text x="100" y="152" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="18" fill="white">${jerseyNumber}</text>
  <circle cx="100" cy="75" r="35" fill="none" stroke="hsl(${hue},50%,60%)" stroke-width="2" opacity="0.5"/>
</svg>`;

  // Use btoa for base64 encoding
  try {
    return 'data:image/svg+xml;base64,' + btoa(svg);
  } catch {
    // Fallback for unicode issues
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }
};

const DEMO_PLAYERS_SEEDED_KEY = 'coachlens_players_seeded';

/**
 * Seed demo player profiles that match the demo match analysis data.
 * Called from storageService.seedDemoMatches after matches and teams are seeded.
 * Uses SVG data URIs for profile pictures to keep localStorage footprint small.
 *
 * @param {Array} demoMatchIds — IDs of the demo matches (for linkedAnalyses pre-population)
 */
export const seedDemoPlayers = (demoMatchIds = []) => {
  // Skip if already seeded
  if (localStorage.getItem(DEMO_PLAYERS_SEEDED_KEY)) return false;

  const existing = _readPlayers();
  if (existing.length > 0) {
    localStorage.setItem(DEMO_PLAYERS_SEEDED_KEY, 'true');
    return false;
  }

  const now = new Date();

  // These players match the names in FALLBACK_ANALYSES so auto-linking works
  const demoPlayers = [
    {
      id: 'demo-player-rahul',
      name: 'Rahul Sharma',
      jerseyNumber: 11,
      role: 'Batsman',
      battingStyle: 'Right Hand',
      bowlingStyle: 'Does Not Bowl',
      age: 24,
      phone: '9834567890',
      notes: 'Most consistent opener. Scores quickly in powerplay. Struggles against left-arm spin — needs specific drills. Captain material.',
      profilePicture: _generateSvgAvatar('Rahul Sharma', 11, 210),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 10).toISOString(),
      linkedAnalyses: demoMatchIds.filter((_, i) => [0, 3, 4].includes(i)),
    },
    {
      id: 'demo-player-vikas',
      name: 'Vikas Patel',
      jerseyNumber: 7,
      role: 'Batsman',
      battingStyle: 'Right Hand',
      bowlingStyle: 'Right Arm Medium',
      age: 22,
      phone: '9876543210',
      notes: 'Explosive opener. High-risk, high-reward. Strike rate above 150 in T20s. Needs to improve shot selection against pace.',
      profilePicture: _generateSvgAvatar('Vikas Patel', 7, 30),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 12).toISOString(),
      linkedAnalyses: demoMatchIds.filter((_, i) => [0, 3].includes(i)),
    },
    {
      id: 'demo-player-suresh',
      name: 'Suresh Raina',
      jerseyNumber: 3,
      role: 'All-Rounder',
      battingStyle: 'Left Hand',
      bowlingStyle: 'Right Arm Off-Spin',
      age: 27,
      phone: '9823456789',
      notes: 'Veteran all-rounder. Can bat anywhere from 3-6. Reliable spin option. Leadership qualities — vice-captain.',
      profilePicture: _generateSvgAvatar('Suresh Raina', 3, 145),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 8).toISOString(),
      linkedAnalyses: demoMatchIds.filter((_, i) => [0, 3, 4].includes(i)),
    },
    {
      id: 'demo-player-dev',
      name: 'Dev Kumar',
      jerseyNumber: 22,
      role: 'Bowler',
      battingStyle: 'Right Hand',
      bowlingStyle: 'Right Arm Fast',
      age: 20,
      phone: '9845678901',
      notes: 'Young pace talent. Clocks 140kmph consistently. Death bowling needs work — too many full tosses. High ceiling.',
      profilePicture: _generateSvgAvatar('Dev Kumar', 22, 0),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 20).toISOString(),
      linkedAnalyses: demoMatchIds.filter((_, i) => [0, 3, 4].includes(i)),
    },
    {
      id: 'demo-player-karan',
      name: 'Karan Nair',
      jerseyNumber: 5,
      role: 'Batsman',
      battingStyle: 'Left Hand',
      bowlingStyle: 'Does Not Bowl',
      age: 19,
      phone: '9856789012',
      notes: 'Talented young lefty. Beautiful cover drives. Needs more match temperament and should avoid playing across the line early.',
      profilePicture: _generateSvgAvatar('Karan Nair', 5, 270),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 25).toISOString(),
      linkedAnalyses: demoMatchIds.filter((_, i) => [0].includes(i)),
    },
    {
      id: 'demo-player-priya',
      name: 'Priya Desai',
      jerseyNumber: 17,
      role: 'Bowler',
      battingStyle: 'Right Hand',
      bowlingStyle: 'Left Arm Orthodox',
      age: 23,
      phone: '',
      notes: 'Left-arm spinner with good flight. Economy rate needs improvement. Gets turn on day-2 pitches. Can bat a bit at 8-9.',
      profilePicture: _generateSvgAvatar('Priya Desai', 17, 320),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 18).toISOString(),
      linkedAnalyses: demoMatchIds.filter((_, i) => [3, 4].includes(i)),
    },
    {
      id: 'demo-player-rohit',
      name: 'Rohit Menon',
      jerseyNumber: 1,
      role: 'Wicket-Keeper',
      battingStyle: 'Right Hand',
      bowlingStyle: 'Does Not Bowl',
      age: 25,
      phone: '9867890123',
      notes: 'Sharp glovework. Quick stumpings. Batting average 28 in T20s — solid at 6 or 7. Good communicator behind the stumps.',
      profilePicture: _generateSvgAvatar('Rohit Menon', 1, 50),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 5).toISOString(),
      linkedAnalyses: [],
    },
    {
      id: 'demo-player-arjun',
      name: 'Arjun Das',
      jerseyNumber: 9,
      role: 'Bowler',
      battingStyle: 'Right Hand',
      bowlingStyle: 'Right Arm Medium',
      age: 21,
      phone: '',
      notes: 'Swing bowler. Effective with new ball. Economy spikes after 3rd over. Potential to develop a slower ball variation.',
      profilePicture: _generateSvgAvatar('Arjun Das', 9, 180),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(),
      linkedAnalyses: [],
    },
  ];

  _writePlayers(demoPlayers);
  localStorage.setItem(DEMO_PLAYERS_SEEDED_KEY, 'true');
  return true;
};
