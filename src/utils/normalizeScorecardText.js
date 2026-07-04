/**
 * Normalizes various cricket scorecard text formats into a clean,
 * consistent plain-text format the CoachLens LLM pipeline can parse.
 *
 * Handles:
 *  - Column-aligned tables (from CricHeroes copy-paste)
 *  - Unicode dashes, bullets, and special chars
 *  - WhatsApp-style scorecard text
 *  - Missing over-by-over data
 *  - Duplicate whitespace and blank lines
 */

/**
 * Collapses excess whitespace while preserving line breaks.
 * @param {string} text
 * @returns {string}
 */
function collapseWhitespace(text) {
  return text
    .split('\n')
    .map(line => line.replace(/[ \t]{2,}/g, '  ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Normalizes unicode characters commonly seen in CricHeroes copy-paste output.
 * @param {string} text
 * @returns {string}
 */
function normalizeUnicode(text) {
  return text
    .replace(/[\u2013\u2014\u2015]/g, '-')  // en-dash, em-dash → hyphen
    .replace(/[\u2018\u2019]/g, "'")         // smart single quotes
    .replace(/[\u201C\u201D]/g, '"')         // smart double quotes
    .replace(/\u00B0/g, ' ')                 // degree symbol
    .replace(/\u2022/g, '-')                 // bullet → dash
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/\r\n/g, '\n')                  // CRLF → LF
    .replace(/\r/g, '\n');
}

/**
 * Detects if the text looks like a tab/space-aligned table row
 * (e.g. from copying a CricHeroes scorecard table directly).
 * @param {string} line
 * @returns {boolean}
 */
function isTableRow(line) {
  return /\s{3,}/.test(line) && /\d/.test(line);
}

/**
 * Converts a tab/space-aligned scorecard table line into a readable format.
 * Input:  "Arjun Kumar   c Patel b Dev   52   36   6   1   144.44"
 * Output: "Arjun Kumar  c Patel b Dev  52 (36)  4s:6  6s:1  SR:144.44"
 * @param {string} line
 * @returns {string}
 */
function normalizeTableRow(line) {
  // Split on 2+ whitespace
  const parts = line.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);

  if (parts.length < 4) return line; // not enough data to reformat

  const name = parts[0];
  const dismissal = parts[1] || '';
  const runs = parts[2] || '';
  const balls = parts[3] || '';
  const fours = parts[4] || '';
  const sixes = parts[5] || '';
  const sr = parts[6] || '';

  // Reconstruct in a readable format
  let formatted = name;
  if (dismissal) formatted += `  ${dismissal}`;
  if (runs && balls) formatted += `  ${runs} (${balls})`;
  else if (runs) formatted += `  ${runs}`;
  if (fours) formatted += `  4s:${fours}`;
  if (sixes) formatted += `  6s:${sixes}`;
  if (sr) formatted += `  SR:${sr}`;

  return formatted;
}

/**
 * Normalizes bowling table rows.
 * Input:  "Dev Kumar   4.0   0   32   1   8.00"
 * Output: "Dev Kumar  4-0-32-1  Econ:8.00"
 * @param {string} line
 * @returns {string}
 */
function normalizeBowlingRow(line) {
  const parts = line.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
  if (parts.length < 5) return line;

  const name = parts[0];
  const overs = parts[1] || '';
  const maidens = parts[2] || '';
  const runs = parts[3] || '';
  const wickets = parts[4] || '';
  const economy = parts[5] || '';

  let formatted = name;
  if (overs && maidens && runs && wickets) {
    formatted += `  ${overs}-${maidens}-${runs}-${wickets}`;
  }
  if (economy) formatted += `  Econ:${economy}`;

  return formatted;
}

/**
 * Detect if a line looks like a bowling stat line
 * (has pattern like "4.0  0  32  1  8.00").
 * @param {string} line
 * @returns {boolean}
 */
function looksLikeBowlingLine(line) {
  return /\b\d+\.\d+\s+\d+\s+\d+\s+\d+\b/.test(line);
}

/**
 * Main normalization function.
 * @param {string} rawText — Raw pasted or fetched scorecard text
 * @returns {string} — Normalized scorecard text
 */
export function normalizeScorecardText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = normalizeUnicode(rawText);

  const lines = text.split('\n');
  const normalized = lines.map(line => {
    const trimmed = line.trimEnd();
    if (!trimmed) return '';

    // Reformat table rows if detected
    if (isTableRow(trimmed)) {
      if (looksLikeBowlingLine(trimmed)) {
        return normalizeBowlingRow(trimmed);
      }
      return normalizeTableRow(trimmed);
    }

    return trimmed;
  });

  return collapseWhitespace(normalized.join('\n'));
}

/**
 * Returns true if the text looks like a URL rather than scorecard content.
 * Used to detect accidental URL pasting in the text area.
 * @param {string} text
 * @returns {boolean}
 */
export function looksLikeUrl(text) {
  const trimmed = (text || '').trim();
  return /^https?:\/\/\S+$/.test(trimmed) || /^(?:www\.)?(?:cricheroes|espncricinfo|cricbuzz)\.\S+$/.test(trimmed);
}

/**
 * Returns true if the text looks like it's from CricHeroes
 * (contains typical CricHeroes formatting patterns).
 * @param {string} text
 * @returns {boolean}
 */
export function looksLikeCricHeroesText(text) {
  const t = (text || '').toLowerCase();
  return (
    t.includes('cricheroes') ||
    /\d+\s+\(\d+\)\s+\d+\s+\d+/.test(text) || // runs (balls) fours sixes pattern
    /\b\d+\.\d+\s+\d+\s+\d+\s+\d+\b/.test(text) // overs maidens runs wickets pattern
  );
}
