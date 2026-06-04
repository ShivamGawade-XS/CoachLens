import { FALLBACK_ANALYSES } from '../utils/fallbackData';

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

const TURNING_POINT_PROMPT = `You are an expert cricket analyst. Given this over-by-over match data, identify the SINGLE over where match momentum shifted most dramatically.

Return ONLY a JSON object with this exact structure:
{
  "over": <number>,
  "reason": "<max 15 words, must cite a specific number from the data>"
}

No preamble. No explanation outside JSON. The reason must reference a specific stat (runs, wickets, dot balls, etc).`;

const WHATSAPP_PROMPT = `You are a cricket team coach writing short personal WhatsApp messages to your players after a match. For each player, write a message that:
1. Is exactly 2 sentences maximum
2. References ONE specific number from their stats (runs scored, strike rate, wickets, economy, etc.)
3. Ends with one concrete practice instruction for the coming week
4. Uses a warm, motivational but professional tone
5. Does NOT use emojis

Player data:
{players}

Return ONLY a JSON object. No preamble:
{
  "messages": [
    {
      "name": "player name",
      "role": "batsman/bowler/allrounder",
      "message": "the 2-sentence WhatsApp message"
    }
  ]
}`;

const TOSS_PROMPT = `You are an expert cricket tactician. Analyze this team's recent match history and stats to recommend a toss decision for their next match.

Team History:
{history}

Return ONLY a JSON object. No preamble.
{
  "decision": "BAT" or "FIELD",
  "confidence": "High" or "Medium",
  "reason": "One clear sentence citing a specific stat (e.g. 'Batting first yields a 75% win rate due to strong powerplay scoring.')"
}`;

const CHAT_SYSTEM_PROMPT = `You are 'CoachLens AI', an expert cricket coaching assistant. 
You are speaking directly to a head coach who manages multiple teams.
Use the provided JSON context about their teams, rosters, and recent match performances to answer their questions.
Be concise, analytical, and highly specific. Cite stats from the context when making recommendations.
Do NOT output markdown code blocks containing JSON, just converse naturally in text.
If the coach asks something unrelated to cricket or their teams, steer them back politely.

CONTEXT:
{context}`;

const FORMAL_REPORT_PROMPT = `You are the Head Coach of a cricket team submitting a formal post-match report to club management.
Using the provided match data, generate a highly professional, well-structured markdown report.

The report MUST include:
1. **Match Summary:** A clear, objective 2-3 sentence overview of the result and overall performance.
2. **Top Performers:** Bulleted list of 2-3 standout players with their stats and impact.
3. **Areas of Concern:** 1-2 points detailing weaknesses or where the match was lost/struggled (e.g. death bowling, top-order collapse).
4. **Next Steps / Action Items:** 2 concrete practice goals or tactical changes for the upcoming week.

Tone: Professional, analytical, objective, and authoritative.
Formatting: Use standard markdown headers (##), bold text, and bullet points. Do not wrap in a code block. Do not add conversational filler.

Match Data:
{matchData}`;

const getHeaders = () => {
  let apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey && typeof window !== 'undefined') {
    apiKey = localStorage.getItem('GROQ_API_KEY');
  }
  const headers = {
    "Content-Type": "application/json"
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return headers;
};

export const groqService = {
  getTurningPoint: async (overData) => {
    try {
      const response = await fetch("/api/groq", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: TURNING_POINT_PROMPT },
            { role: "user", content: JSON.stringify(overData) }
          ],
          temperature: 0.2,
          max_tokens: 200,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return { over: parsed.over, reason: parsed.reason };
    } catch (error) {
      console.warn("Turning point API failed, using fallback:", error);
      return { over: 14, reason: "Over 14 — Wicket + 4 dot balls swung the match" };
    }
  },

  analyze: async (scorecardText, format = 'T20', phase = 'Overall', tone = 'Direct', onChunk = null) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scorecard: scorecardText, format, phase, tone })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || response.statusText || 'Failed to analyze scorecard');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';
      let shareId = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned) continue;
          if (cleaned === 'data: [DONE]') continue;

          if (cleaned.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(cleaned.slice(6));
              if (parsed && parsed.shareId) {
                shareId = parsed.shareId;
              }
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                accumulatedText += content;
                if (onChunk) onChunk(accumulatedText);
              }
            } catch (e) {
              console.error("Stream parse error:", e);
            }
          }
        }
      }

      /** @type {import('../types/analysis').FullAnalysis} */
      let data;
      try {
        data = JSON.parse(accumulatedText);
      } catch (e) {
        throw new Error(`Failed to parse Groq response: ${e.message}. Raw: ${accumulatedText.slice(0, 100)}`);
      }

      return {
        shareId,
        players: (data.players || []).map(p => ({
          name: p.name,
          role: p.role,
          tag: p.tag,
          key_stat: p.position,
          match_impact: "8",
          what_worked: p.whatWorked,
          what_failed: p.whatFailed,
          next_match_instruction: p.nextMatch,
          practice_drill: p.drill
        })),
        team_summary: {
          what_won_lost_match: data.teamReport?.turningPoint,
          strongest_partnership: data.teamReport?.strongestPartnership,
          bowling_inefficiency: data.teamReport?.bowlingInefficiency,
          pattern: data.teamReport?.scoringPattern
        },
        coach_decisions: {
          batting_order_change: data.coachBrief?.battingOrder,
          bowling_rotation: data.coachBrief?.bowlingRotation,
          player_on_notice: data.coachBrief?.playerOnNotice,
          tactical_focus_next_game: data.coachBrief?.tacticalFocus
        }
      };
    } catch (error) {
      console.warn("API failed:", error);
      throw error;
    }
  },

  generateWhatsAppMessages: async (players) => {
    const playerSummaries = players.map(p => ({
      name: p.name,
      role: p.role,
      tag: p.tag,
      key_stat: p.key_stat,
      match_impact: p.match_impact,
      what_worked: p.what_worked,
      what_failed: p.what_failed,
    }));

    const prompt = WHATSAPP_PROMPT.replace('{players}', JSON.stringify(playerSummaries, null, 2));

    const response = await fetch("/api/groq", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Generate WhatsApp messages for each player listed above." }
        ],
        temperature: 0.4,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const data = await response.json();
    const rawResponse = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(rawResponse);
      return parsed.messages || [];
    } catch (e) {
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed.messages || [];
    }
  },

  getTossDecision: async (teamHistory) => {
    const prompt = TOSS_PROMPT.replace('{history}', JSON.stringify(teamHistory, null, 2));

    const response = await fetch("/api/groq", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Recommend a toss decision based on this history." }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const data = await response.json();
    const rawResponse = data.choices[0].message.content;
    
    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    }
  },

  chatWithCoachLens: async (messages, contextData) => {
    const systemPrompt = CHAT_SYSTEM_PROMPT.replace('{context}', JSON.stringify(contextData));
    
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch("/api/groq", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: apiMessages,
        temperature: 0.5,
        max_tokens: 800
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content;
  },

  generateFormalReport: async (matchData) => {
    const { rawScorecard, ...leanMatchData } = matchData;
    const prompt = FORMAL_REPORT_PROMPT.replace('{matchData}', JSON.stringify(leanMatchData, null, 2));

    const response = await fetch("/api/groq", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || response.statusText;
      throw new Error(`API error: ${errMsg}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  },

  getOverRecommendation: async (matchState) => {
    const prompt = `You are a tactical cricket coach sitting in the dugout during a live match. Based on the current match state below, give exactly 2-3 sharp tactical recommendations for the next over.

Rules:
- Be extremely specific. Name player roles, cite numbers from the data.
- Each recommendation must be 1 sentence max.
- If a bowler has remaining quota, mention it.
- Reference the opponent batsman's weakness if known.
- No filler. No pleasantries. Pure dugout talk.

Match State:
${JSON.stringify(matchState, null, 2)}

Return ONLY a JSON object:
{
  "recommendations": [
    { "action": "short tactical instruction", "reason": "one stat-backed reason" }
  ],
  "pressure_rating": "Low|Medium|High|Critical",
  "projected_total": <number or null>
}`;

    const response = await fetch("/api/groq", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(`API error: ${errData?.error?.message || response.statusText}`);
    }
    const data = await response.json();
    try {
      return JSON.parse(data.choices[0].message.content);
    } catch {
      return { recommendations: [{ action: "Continue current plan", reason: "Unable to parse AI response" }], pressure_rating: "Medium" };
    }
  },

  selectBestXI: async (squad, opponentInfo) => {
    const prompt = `You are a cricket team selector. From the squad below, pick the best playing XI for the given match context.

Squad (${squad.length} players):
${squad.map((p, i) => `${i + 1}. ${p.name} — ${p.role}${p.stats ? ' (' + p.stats + ')' : ''}`).join('\n')}

Opponent/Match Context:
${opponentInfo}

Rules:
- Pick exactly 11 players.
- Ensure balance: min 5 batsmen, min 4 bowlers (allrounders count for both).
- For each DROPPED player, give a 1-sentence reason citing a specific stat or tactical reason.
- For each SELECTED player, give a 1-sentence reason.
- Order the XI by batting position.

Return ONLY a JSON object:
{
  "playing_xi": [
    { "name": "player name", "role": "role", "batting_position": <number>, "reason": "why selected" }
  ],
  "dropped": [
    { "name": "player name", "reason": "why dropped" }
  ],
  "team_balance": "brief 1-sentence assessment of team composition"
}`;

    const response = await fetch("/api/groq", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(`API error: ${errData?.error?.message || response.statusText}`);
    }
    const data = await response.json();
    try {
      return JSON.parse(data.choices[0].message.content);
    } catch {
      return { playing_xi: [], dropped: [], team_balance: "Unable to parse AI response" };
    }
  }
};
