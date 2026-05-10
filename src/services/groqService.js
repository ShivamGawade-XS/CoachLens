import { FALLBACK_ANALYSES } from '../utils/fallbackData';

const PLAYER_PROMPT = `You are an expert cricket coach analyst. Analyze this match scorecard and return ONLY a JSON object. No preamble.
Match Format: {format}
Match Phase Focus: {phase}
Scorecard: {scorecard}

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
Scorecard: {scorecard}

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
Scorecard: {scorecard}

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

export const groqService = {
  getTurningPoint: async (overData) => {
    let apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = localStorage.getItem('GROQ_API_KEY');
    }

    if (!apiKey) {
      // Fallback turning point for demo
      return { over: 14, reason: "Over 14 — Wicket + 4 dot balls, run rate dropped from 9.2 to 5.1" };
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
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

  analyze: async (format, phase, scorecardText, onProgress) => {
    let apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = localStorage.getItem('GROQ_API_KEY');
    }
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("No Groq API key configured. Please add it in Settings.");
    }

    const runCall = async (promptTemplate) => {
      const prompt = promptTemplate
        .replace('{format}', format)
        .replace('{phase}', phase)
        .replace('{scorecard}', scorecardText);

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
            { role: "user", content: scorecardText }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data = await response.json();
      const rawResponse = data.choices[0].message.content;
      try {
        return JSON.parse(rawResponse);
      } catch (e) {
        return JSON.parse(rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      }
    };

    const analysisTask = async () => {
      try {
        // Stage 1: Reading is fast, notify immediately
        if (onProgress) onProgress('stage1');
        
        // Stage 2: Players
        const playersData = await runCall(PLAYER_PROMPT);
        if (onProgress) onProgress('stage2');

        // Stage 3: Team Report
        const teamData = await runCall(TEAM_PROMPT);
        if (onProgress) onProgress('stage3');

        // Stage 4: Coach Brief
        const briefData = await runCall(BRIEF_PROMPT);
        if (onProgress) onProgress('stage4');

        return {
          players: playersData.players || [],
          team_summary: teamData.team_summary || {},
          coach_decisions: briefData.coach_decisions || {}
        };
      } catch (err) {
        throw err;
      }
    };

    // Strict 45-second timeout to allow LLM sequence to complete
    const timeoutTask = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout exceeded")), 45000);
    });

    try {
      return await Promise.race([analysisTask(), timeoutTask]);
    } catch (error) {
      console.warn("API failed or timed out, triggering smart fallback:", error);
      throw error;
    }
  },

  generateWhatsAppMessages: async (players) => {
    let apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = localStorage.getItem('GROQ_API_KEY');
    }

    if (!apiKey) {
      throw new Error("No API key");
    }

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
    let apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = localStorage.getItem('GROQ_API_KEY');
    }

    if (!apiKey) throw new Error("No API key");

    const prompt = TOSS_PROMPT.replace('{history}', JSON.stringify(teamHistory, null, 2));

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
    let apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = localStorage.getItem('GROQ_API_KEY');
    }

    if (!apiKey) throw new Error("No API key");

    const systemPrompt = CHAT_SYSTEM_PROMPT.replace('{context}', JSON.stringify(contextData));
    
    // Construct messages array starting with system prompt
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
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
    let apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = localStorage.getItem('GROQ_API_KEY');
    }
    if (!apiKey) {
      throw new Error("No Groq API key configured.");
    }

    // Strip rawScorecard to save massive token overhead and prevent Payload Too Large errors
    const { rawScorecard, ...leanMatchData } = matchData;
    const prompt = FORMAL_REPORT_PROMPT.replace('{matchData}', JSON.stringify(leanMatchData, null, 2));

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
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
  }
};
