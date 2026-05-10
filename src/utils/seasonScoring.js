// Fallback map if Groq didn't provide a numerical match_impact
const TAG_FALLBACK_SCORES = {
  'Aggressor': 8,
  'Anchor': 7.5,
  'Improving': 6,
  'Liability': 4
};

/**
 * Calculates season-long consistency scores for all players across all provided matches.
 * 
 * @param {Array} matches - Array of match objects from storage
 * @returns {Array} Array of player form objects sorted by score
 */
export const calculateSeasonForm = (matches) => {
  if (!matches || matches.length === 0) return [];

  // Sort matches oldest to newest so historical trends make sense
  const chronologicalMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

  const playerStats = {};

  chronologicalMatches.forEach((match, matchIndex) => {
    if (!match.analysis || !match.analysis.players) return;

    match.analysis.players.forEach(player => {
      if (!playerStats[player.name]) {
        playerStats[player.name] = {
          name: player.name,
          role: player.role,
          appearances: 0,
          scores: []
        };
      }

      let impactScore = 0;
      if (player.match_impact && !isNaN(parseFloat(player.match_impact))) {
        impactScore = parseFloat(player.match_impact);
      } else {
        impactScore = TAG_FALLBACK_SCORES[player.tag] || 5;
      }

      playerStats[player.name].appearances += 1;
      playerStats[player.name].scores.push({
        score: impactScore,
        matchIndex: matchIndex
      });
    });
  });

  // Calculate final metrics for each player
  const formResults = Object.values(playerStats).map(player => {
    const totalScore = player.scores.reduce((sum, s) => sum + s.score, 0);
    const overallAvg = totalScore / player.scores.length;

    // Calculate trend (compare last 1-2 matches against the rest)
    let trend = 'flat';
    if (player.scores.length >= 2) {
      const recentScores = player.scores.slice(-2);
      const recentAvg = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;
      
      if (recentAvg > overallAvg + 0.5) trend = 'up';
      else if (recentAvg < overallAvg - 0.5) trend = 'down';
    }

    return {
      name: player.name,
      role: player.role,
      appearances: player.appearances,
      score: Number(overallAvg.toFixed(1)),
      trend: trend
    };
  });

  // Sort by highest score first
  return formResults.sort((a, b) => b.score - a.score);
};

/**
 * Generates a visual form guide (e.g. ['W', 'L', 'W']) for a specific match's point in time.
 * @param {Array} allMatches - All matches, unfiltered
 * @param {string} matchId - The ID of the match to generate the guide for
 * @returns {Array} Array of strings 'W' or 'L'
 */
export const getTeamFormGuide = (allMatches, matchId) => {
  if (!allMatches || allMatches.length === 0) return [];
  
  // Sort oldest to newest
  const chronological = [...allMatches].sort((a, b) => new Date(a.date) - new Date(b.date));
  const currentIndex = chronological.findIndex(m => m.id === matchId);
  
  if (currentIndex === -1) return [];

  // Get the last 3 matches up to and including this one
  const relevantMatches = chronological.slice(Math.max(0, currentIndex - 2), currentIndex + 1);
  
  return relevantMatches.map(m => m.result === 'Won' ? 'W' : 'L');
};
