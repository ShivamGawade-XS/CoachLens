/**
 * Pure client-side coaching intelligence metrics.
 * No API calls — all derived from existing AI analysis data.
 */

/**
 * Calculates an "Intent Score" (1-10) for a player based on their effort indicators.
 * A low intent score flags passive/coasting players.
 * 
 * @param {Object} player - Player object from AI analysis
 * @returns {Object} { score: number, label: string, color: string }
 */
export const calculateIntentScore = (player) => {
  if (!player) return { score: 5, label: 'Unknown', color: 'textTertiary' };

  let score = 5; // baseline

  // Factor 1: Tag-based baseline
  const tagScores = { 'Aggressor': 3, 'Anchor': 1, 'Improving': 1.5, 'Liability': -1 };
  score += tagScores[player.tag] || 0;

  // Factor 2: Match impact directly adds
  if (player.match_impact) {
    const impact = parseFloat(player.match_impact);
    if (!isNaN(impact)) {
      score += (impact - 5) * 0.3; // Deviation from average
    }
  }

  // Factor 3: Parse what_failed for passive indicators (penalize)
  const failedText = (player.what_failed || '').toLowerCase();
  const passiveKeywords = ['dot ball', 'dots', 'slow', 'passive', 'no boundary', 'zero boundaries', 'sr 6', 'sr 7', 'didn\'t rotate', 'static'];
  const passiveHits = passiveKeywords.filter(k => failedText.includes(k)).length;
  score -= passiveHits * 0.8;

  // Factor 4: Parse what_worked for aggressive indicators (reward)
  const workedText = (player.what_worked || '').toLowerCase();
  const activeKeywords = ['boundary', 'boundaries', 'sixes', 'six', 'attack', 'aggressive', 'dominated', 'accelerat', 'wicket', 'yorker', 'tight'];
  const activeHits = activeKeywords.filter(k => workedText.includes(k)).length;
  score += activeHits * 0.5;

  // Clamp between 1-10
  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

  // Determine label
  let label, color;
  if (score >= 8) { label = 'High Intent'; color = 'aggressor'; }
  else if (score >= 6) { label = 'Committed'; color = 'anchor'; }
  else if (score >= 4) { label = 'Passive'; color = 'improving'; }
  else { label = 'Coasting'; color = 'liability'; }

  return { score: Number(score.toFixed(1)), label, color };
};

/**
 * Calculates Clutch Factor for players across multiple matches.
 * Compares average match_impact in Wins vs Losses.
 * 
 * @param {Array} matches - All stored matches
 * @returns {Object} Map of playerName -> { winAvg, lossAvg, badge, badgeColor }
 */
export const calculateClutchFactors = (matches) => {
  if (!matches || matches.length < 2) return {};

  const playerWinLoss = {};

  matches.forEach(match => {
    if (!match.analysis?.players || !match.result) return;
    const isWin = match.result === 'Won';

    match.analysis.players.forEach(player => {
      if (!playerWinLoss[player.name]) {
        playerWinLoss[player.name] = { winScores: [], lossScores: [] };
      }

      let impact = parseFloat(player.match_impact);
      if (isNaN(impact)) {
        const fallback = { 'Aggressor': 8, 'Anchor': 7, 'Improving': 6, 'Liability': 4 };
        impact = fallback[player.tag] || 5;
      }

      if (isWin) playerWinLoss[player.name].winScores.push(impact);
      else playerWinLoss[player.name].lossScores.push(impact);
    });
  });

  const results = {};
  Object.entries(playerWinLoss).forEach(([name, data]) => {
    const winAvg = data.winScores.length > 0 
      ? data.winScores.reduce((a, b) => a + b, 0) / data.winScores.length : null;
    const lossAvg = data.lossScores.length > 0 
      ? data.lossScores.reduce((a, b) => a + b, 0) / data.lossScores.length : null;

    let badge = 'Consistent';
    let badgeColor = 'anchor';

    if (winAvg !== null && lossAvg !== null) {
      const diff = winAvg - lossAvg;
      if (diff > 2) { badge = 'Frontrunner'; badgeColor = 'improving'; }
      else if (diff < -1) { badge = 'Big Match Player'; badgeColor = 'aggressor'; }
      else { badge = 'Consistent'; badgeColor = 'anchor'; }
    } else if (winAvg !== null && lossAvg === null) {
      badge = 'Untested'; badgeColor = 'anchor';
    } else if (winAvg === null && lossAvg !== null) {
      badge = 'Needs Wins'; badgeColor = 'liability';
    }

    results[name] = {
      winAvg: winAvg ? Number(winAvg.toFixed(1)) : null,
      lossAvg: lossAvg ? Number(lossAvg.toFixed(1)) : null,
      badge,
      badgeColor
    };
  });

  return results;
};

/**
 * Determines a pressure performance label for a player.
 * Parses AI text for pressure/death-over keywords.
 * 
 * @param {Object} player - Player object from AI analysis
 * @returns {Object} { label: string, color: string } or null if inconclusive
 */
export const getPressureIndex = (player) => {
  if (!player) return null;

  const worked = (player.what_worked || '').toLowerCase();
  const failed = (player.what_failed || '').toLowerCase();
  const role = (player.role || '').toLowerCase();

  // Pressure-positive keywords
  const clutchKeywords = ['death', 'last over', 'pressure', 'crucial', 'chase', 'closing', 'finish', 'yorker', 'held nerve', 'slog', 'final'];
  const clutchWorked = clutchKeywords.filter(k => worked.includes(k)).length;
  const clutchFailed = clutchKeywords.filter(k => failed.includes(k)).length;

  // Collapse keywords
  const collapseKeywords = ['collapse', 'crumble', 'panic', 'expensive', 'leaked', 'no variation', 'run out'];
  const collapseCount = collapseKeywords.filter(k => failed.includes(k)).length;

  const netScore = clutchWorked - clutchFailed - collapseCount;

  if (netScore >= 2) return { label: 'Clutch', icon: '🧊', color: 'aggressor' };
  if (netScore <= -1) return { label: 'Pressure Risk', icon: '⚡', color: 'liability' };
  return null; // Inconclusive — don't show
};
