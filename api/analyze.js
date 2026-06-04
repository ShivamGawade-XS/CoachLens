const PLAYER_PROMPT = `You are an expert cricket coach analyst. Analyze this match scorecard and return ONLY a JSON object. No preamble.
Match Format: {format}
Match Phase Focus: {phase}
Tone: {tone}
Scorecard: {scorecard}

CRITICAL: Generate all text fields (what_worked, what_failed, instructions) strictly adhering to the requested Tone.
- If Direct: Be purely objective and analytical.
- If Encouraging: Focus on positives, potential, and constructive learning.
- If Brutal Honest: Do not hold back. Criticize poor numbers fiercely, use harsh truths.

Return exactly this structure:
{
  "players": [
    {
      "name": "player name",
      "role": "batsman/bowler/allrounder",
      "tag": "Anchor|Aggressor|Liability|Improving",
      "key_stat": "e.g. 45 (30)",
      "match_impact": "impact score out of 10",
      "what_worked": "specific and factual",
      "what_failed": "specific and factual",
      "next_match_instruction": "one concrete actionable change",
      "practice_drill": "one specific drill"
    }
  ]
}`;

const TEAM_PROMPT = `You are an expert cricket coach analyst. Analyze this match scorecard and return ONLY a JSON object. No preamble.
Match Format: {format}
Match Phase Focus: {phase}
Tone: {tone}
Scorecard: {scorecard}

CRITICAL: Generate all text fields strictly adhering to the requested Tone.
- If Direct: Be purely objective and analytical.
- If Encouraging: Focus on positives, potential, and constructive learning.
- If Brutal Honest: Do not hold back. Criticize poor numbers fiercely, use harsh truths.

Return exactly this structure:
{
  "team_summary": {
    "what_won_lost_match": "specific over and event",
    "strongest_partnership": "player names and runs",
    "bowling_inefficiency": "specific bowler and overs",
    "pattern": "one key team-level tactical observation"
  }
}`;

const BRIEF_PROMPT = `You are an expert cricket coach analyst. Analyze this match scorecard and return ONLY a JSON object. No preamble.
Match Format: {format}
Match Phase Focus: {phase}
Tone: {tone}
Scorecard: {scorecard}

CRITICAL: Generate all text fields strictly adhering to the requested Tone.
- If Direct: Be purely objective and analytical.
- If Encouraging: Focus on positives, potential, and constructive learning.
- If Brutal Honest: Do not hold back. Criticize poor numbers fiercely, use harsh truths.

Return exactly this structure:
{
  "coach_decisions": {
    "batting_order_change": "specific swap with reason",
    "bowling_rotation": "specific change with reason",
    "player_on_notice": "name and why",
    "tactical_focus_next_game": "one sentence"
  }
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { scorecard, format = 'T20', phase = 'Overall', tone = 'Direct' } = req.body || {};

  if (!scorecard) {
    return res.status(400).json({ error: 'Missing scorecard data' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API key not configured on server' });
  }

  const processPrompt = (promptTemplate) => {
    return promptTemplate
      .replace('{format}', format)
      .replace('{phase}', phase)
      .replace('{tone}', tone)
      .replace('{scorecard}', scorecard);
  };

  const runCall = async (promptTemplate, maxTokens = 1500) => {
    const prompt = processPrompt(promptTemplate);
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: scorecard }
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || response.statusText;
      throw new Error(`Groq API error: ${errMsg}`);
    }

    const data = await response.json();
    const rawResponse = data.choices[0].message.content;
    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      return JSON.parse(rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    }
  };

  try {
    const [playersData, teamData, briefData] = await Promise.all([
      runCall(PLAYER_PROMPT, 800),
      runCall(TEAM_PROMPT, 400),
      runCall(BRIEF_PROMPT, 400)
    ]);

    const extractKey = (obj, expectedKey) => {
      if (!obj) return null;
      if (obj[expectedKey]) return obj[expectedKey];
      const key = Object.keys(obj).find(k => k.toLowerCase() === expectedKey.toLowerCase());
      if (key) return obj[key];
      const values = Object.values(obj);
      if (expectedKey === 'players') {
        if (Array.isArray(obj)) return obj;
        if (values.length === 1 && Array.isArray(values[0])) return values[0];
      } else {
        if (values.length === 1 && typeof values[0] === 'object') return values[0];
      }
      return null;
    };

    return res.status(200).json({
      players: extractKey(playersData, 'players') || [],
      team_summary: extractKey(teamData, 'team_summary') || {},
      coach_decisions: extractKey(briefData, 'coach_decisions') || {}
    });
  } catch (error) {
    console.error("Analysis handler failed:", error);
    return res.status(500).json({ error: error.message });
  }
}
