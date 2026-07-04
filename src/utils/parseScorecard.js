import { looksLikeUrl } from './normalizeScorecardText';

/**
 * Validates a raw scorecard string before submission to the AI analysis pipeline.
 * The actual parsing (player extraction, innings breakdown) is intentionally deferred
 * to the LLM in api/analyze.js, since CricHeroes formats vary significantly.
 *
 * @param {string} rawText — Raw pasted or OCR'd scorecard text
 * @returns {{ isValid: boolean, error: string|null, hint: string|null }}
 */
export const parseScorecard = (rawText) => {
  const text = (rawText || '').trim();

  if (text.length < 50) {
    return { isValid: false, error: 'Scorecard text is too short. Please paste a full scorecard.', hint: null };
  }

  // Detect if user accidentally pasted a URL instead of scorecard text
  if (looksLikeUrl(text)) {
    return {
      isValid: false,
      error: 'That looks like a URL. Switch to the Import URL tab to auto-import from a link.',
      hint: 'url_tab',
    };
  }

  // Basic structural check: a valid scorecard should contain at least
  // some numeric data (runs, overs, wickets) alongside player names.
  const hasNumbers = /\d/.test(text);
  if (!hasNumbers) {
    return { isValid: false, error: 'No numeric data found. Please paste a scorecard with stats.', hint: null };
  }

  // Check for at least one player-name-like pattern with an adjacent score
  // This catches obviously invalid pastes (e.g., news articles, team announcements)
  const hasPlayerData = /[A-Z][a-z]+ [A-Z][a-z]+[\s\S]{0,40}\d{1,3}/.test(text);
  const hasMatchData = /(?:over|wicket|run|total|innings|batting|bowling)/i.test(text);

  if (!hasPlayerData && !hasMatchData) {
    return {
      isValid: false,
      error: "This doesn't look like a scorecard. Paste the full batting and bowling data from your match.",
      hint: null,
    };
  }

  return { isValid: true, error: null, hint: null };
};
