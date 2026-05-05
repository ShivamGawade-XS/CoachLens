import { FALLBACK_ANALYSES } from '../utils/fallbackData';

const SYSTEM_PROMPT = `You are an expert cricket coach analyst with 15 years of experience 
coaching amateur T20 teams in India.

Analyze this match scorecard and return ONLY a JSON object.
No preamble. No explanation outside the JSON.

Match Format: {format}
Match Phase Focus: {phase}
Scorecard: {scorecard}

Return this exact structure:
{
  "team_summary": {
    "what_won_lost_match": "specific over and event",
    "strongest_partnership": "player names and runs",
    "bowling_inefficiency": "specific bowler and overs",
    "pattern": "one key team-level tactical observation"
  },
  "players": [
    {
      "name": "player name",
      "role": "batsman/bowler/allrounder",
      "tag": "Anchor|Aggressor|Liability|Improving",
      "key_stat": "e.g. 45 (30) or 2-24 (if applicable)",
      "match_impact": "impact score out of 10",
      "what_worked": "specific and factual",
      "what_failed": "specific and factual",
      "next_match_instruction": "one concrete actionable change",
      "practice_drill": "one specific drill"
    }
  ],
  "coach_decisions": {
    "batting_order_change": "specific swap with reason",
    "bowling_rotation": "specific change with reason",
    "player_on_notice": "name and why",
    "tactical_focus_next_game": "one sentence"
  }
}`;

export const groqService = {
  analyze: async (format, phase, scorecardText) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    // Fallback if no API key is provided or for demo safety
    if (!apiKey) {
      console.warn("No Groq API key found. Using fallback demo data.");
      return new Promise((resolve) => {
        setTimeout(() => resolve(FALLBACK_ANALYSES.demo_live), 2500); // simulate network delay
      });
    }

    try {
      const prompt = SYSTEM_PROMPT
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
          max_tokens: 2000,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawResponse = data.choices[0].message.content;
      
      try {
        return JSON.parse(rawResponse);
      } catch (e) {
        const cleaned = rawResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        return JSON.parse(cleaned);
      }
      
    } catch (error) {
      console.warn("API failed, using fallback:", error);
      return FALLBACK_ANALYSES.demo_live;
    }
  }
};
