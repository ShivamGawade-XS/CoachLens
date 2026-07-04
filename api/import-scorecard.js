export const config = { runtime: 'edge' };

/**
 * POST /api/import-scorecard
 * Body: { url: string }
 *
 * Attempts to fetch a CricHeroes (or similar) scorecard page server-side,
 * parse the HTML tables, and return normalized scorecard text.
 *
 * Falls back to a platform-specific step-by-step guide when the page is blocked.
 */

const PLATFORM_GUIDES = {
  cricheroes: {
    name: 'CricHeroes',
    steps: [
      'Open the CricHeroes app or website on your device',
      'Navigate to your match and tap the Scorecard tab',
      'On the app: tap Share → Copy Text. On the website: select all text on the page (Ctrl+A / Cmd+A)',
      'Come back to CoachLens and paste the copied text in the Paste tab',
    ],
  },
  espncricinfo: {
    name: 'ESPNcricinfo',
    steps: [
      'Open the ESPNcricinfo match scorecard page',
      'Select all the scorecard text on the page (Ctrl+A / Cmd+A)',
      'Copy it (Ctrl+C / Cmd+C)',
      'Come back to CoachLens and paste the copied text in the Paste tab',
    ],
  },
  cricbuzz: {
    name: 'Cricbuzz',
    steps: [
      'Open the Cricbuzz scorecard page for your match',
      'Select all text (Ctrl+A / Cmd+A) and copy (Ctrl+C / Cmd+C)',
      'Come back to CoachLens and paste the copied text in the Paste tab',
    ],
  },
  generic: {
    name: 'Scorecard',
    steps: [
      'Open the scorecard page in your browser',
      'Select all text on the page (Ctrl+A / Cmd+A)',
      'Copy it (Ctrl+C / Cmd+C)',
      'Come back to CoachLens and paste the copied text in the Paste tab',
    ],
  },
};

/**
 * Detect which cricket platform a URL belongs to.
 */
function detectPlatform(url) {
  const lower = url.toLowerCase();
  if (lower.includes('cricheroes.in') || lower.includes('cricheroes.com')) return 'cricheroes';
  if (lower.includes('espncricinfo.com') || lower.includes('cricinfo.com')) return 'espncricinfo';
  if (lower.includes('cricbuzz.com')) return 'cricbuzz';
  return 'generic';
}

/**
 * Validate that the URL is a recognizable cricket scorecard URL.
 */
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    const validHosts = [
      'cricheroes.in', 'www.cricheroes.in',
      'espncricinfo.com', 'www.espncricinfo.com',
      'cricbuzz.com', 'www.cricbuzz.com',
      'm.cricheroes.in',
    ];
    if (!validHosts.some(h => parsed.hostname === h)) {
      return { valid: false, error: 'URL must be from CricHeroes, ESPNcricinfo, or Cricbuzz.' };
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only http/https URLs are accepted.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL.' };
  }
}

/**
 * Strip all HTML tags from a string.
 */
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Extract scorecard lines from CricHeroes HTML.
 * CricHeroes uses table rows for batting/bowling data.
 */
function parseCricHeroesHtml(html) {
  const lines = [];

  // Extract match title from page title or h1
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const title = stripHtml(titleMatch[1]).replace(/\s*\|\s*CricHeroes.*/i, '').trim();
    if (title) lines.push(title, '');
  }

  // Try to find h1/h2 match headers
  const h1Match = html.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i);
  if (h1Match && !lines.length) {
    lines.push(stripHtml(h1Match[1]).trim(), '');
  }

  // Find all table rows - CricHeroes scorecard tables have player data in <td> cells
  const tableRowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let tableMatch;

  let inScorecardSection = false;
  let currentSection = '';

  // Find section headers (batting/bowling innings)
  const sectionPattern = /<(?:h[1-6]|th|div)[^>]*class="[^"]*(?:innings|batting|bowling|team)[^"]*"[^>]*>([\s\S]*?)<\/(?:h[1-6]|th|div)>/gi;
  let sectionMatch;
  const sections = [];
  while ((sectionMatch = sectionPattern.exec(html)) !== null) {
    const text = stripHtml(sectionMatch[1]).trim();
    if (text && text.length < 100) {
      sections.push({ index: sectionMatch.index, text });
    }
  }

  // Walk table rows
  const rowTexts = [];
  while ((tableMatch = tableRowPattern.exec(html)) !== null) {
    const rowHtml = tableMatch[1];
    const cells = [];
    let cellMatch;
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    while ((cellMatch = cellRe.exec(rowHtml)) !== null) {
      const cellText = stripHtml(cellMatch[1]).trim();
      if (cellText) cells.push(cellText);
    }
    if (cells.length >= 3) {
      rowTexts.push(cells.join('  '));
    }
  }

  if (rowTexts.length > 0) {
    lines.push(...rowTexts);
  }

  return lines.join('\n').trim();
}

/**
 * Extract scorecard text from generic HTML by finding text-heavy sections.
 */
function parseGenericHtml(html) {
  // Remove scripts, styles, nav, footer, header
  const cleaned = html
    .replace(/<(?:script|style|nav|footer|header|aside)[^>]*>[\s\S]*?<\/(?:script|style|nav|footer|header|aside)>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ');

  // Collapse lines, remove short lines (navigation links etc.)
  const lines = cleaned
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 3);

  // Keep lines that look like scorecard data (contain numbers + cricket patterns)
  const scorecardLines = lines.filter(line => {
    const hasNumbers = /\d/.test(line);
    const looksLikeCricket = /(?:run|wicket|over|ball|bat|bowl|catch|lbw|not out|b |c |\d\/\d|\d+\s+\(\d+\))/i.test(line);
    return hasNumbers || looksLikeCricket;
  });

  return scorecardLines.join('\n').trim();
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url } = body || {};

  if (!url || typeof url !== 'string') {
    return new Response(JSON.stringify({ success: false, error: 'A URL is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const trimmedUrl = url.trim();
  const validation = validateUrl(trimmedUrl);
  if (!validation.valid) {
    return new Response(JSON.stringify({ success: false, error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const platform = detectPlatform(trimmedUrl);
  const guide = PLATFORM_GUIDES[platform] || PLATFORM_GUIDES.generic;

  // Attempt server-side fetch with full browser-spoofed headers
  let html = null;
  let fetchError = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(trimmedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      fetchError = `HTTP ${response.status}`;
    } else {
      html = await response.text();
    }
  } catch (err) {
    fetchError = err.name === 'AbortError' ? 'Request timed out' : err.message;
  }

  // If we got HTML, try to parse the scorecard
  if (html) {
    let scorecard = '';

    if (platform === 'cricheroes') {
      scorecard = parseCricHeroesHtml(html);
    } else {
      scorecard = parseGenericHtml(html);
    }

    // Scorecard must have meaningful content to be useful
    if (scorecard && scorecard.length > 100) {
      return new Response(
        JSON.stringify({ success: true, scorecard, platform }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // HTML fetched but scorecard parsing found nothing useful
    fetchError = 'Scorecard data could not be extracted from this page.';
  }

  // Fallback: return guide
  return new Response(
    JSON.stringify({
      success: false,
      error: fetchError || 'Could not extract scorecard automatically.',
      platform,
      guide: {
        ...guide,
        url: trimmedUrl,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
