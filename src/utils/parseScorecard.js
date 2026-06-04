/**
 * Validates a raw scorecard string before submission to the AI analysis pipeline.
 * The actual parsing (player extraction, innings breakdown) is intentionally deferred
 * to the LLM in api/analyze.js, since CricHeroes formats vary significantly.
 *
 * @param {string} rawText — Raw pasted or OCR'd scorecard text
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const parseScorecard = (rawText) => {
  const text = (rawText || '').trim();

  if (text.length < 50) {
    return { isValid: false, error: 'Scorecard text is too short. Please paste a full scorecard.' };
  }

  // Basic structural check: a valid scorecard should contain at least
  // some numeric data (runs, overs, wickets) alongside player names.
  const hasNumbers = /\d/.test(text);
  if (!hasNumbers) {
    return { isValid: false, error: 'No numeric data found. Please paste a scorecard with stats.' };
  }

  return { isValid: true, error: null };
};
