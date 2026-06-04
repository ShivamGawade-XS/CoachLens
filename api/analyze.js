export const config = {
  runtime: 'edge',
};

const CONSOLIDATED_PROMPT = `You are an expert cricket coach analyst. Analyze this match scorecard and return ONLY a JSON object. No preamble.
Match Format: {format}
Match Phase Focus: {phase}
Tone: {tone}
Scorecard: {scorecard}

CRITICAL: Generate all text fields strictly adhering to the requested Tone.
- If Direct: Be purely objective and analytical.
- If Encouraging: Focus on positives, potential, and constructive learning.
- If Brutal Honest: Do not hold back. Criticize poor numbers fiercely, use harsh truths.

You must follow the JSON schema specified in the response_format. Generate player tags strictly from the enum list. Position must represent the key stat for the player (e.g., "45 (30)" or "3/15 (4)").`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { scorecard, format = 'T20', phase = 'Overall', tone = 'Direct' } = await req.json().catch(() => ({}));

  if (!scorecard) {
    return new Response(JSON.stringify({ error: 'Missing scorecard data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Groq API key not configured on server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const prompt = CONSOLIDATED_PROMPT
    .replace('{format}', format)
    .replace('{phase}', phase)
    .replace('{tone}', tone)
    .replace('{scorecard}', scorecard);

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
          { role: "system", content: prompt },
          { role: "user", content: scorecard }
        ],
        temperature: 0.3,
        stream: true,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "analysis_response",
            schema: {
              type: "object",
              properties: {
                players: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      role: { type: "string" },
                      position: { type: "string" },
                      tag: {
                        type: "string",
                        enum: ["Aggressor", "Anchor", "Improving", "Liability"]
                      },
                      whatWorked: { type: "string" },
                      whatFailed: { type: "string" },
                      nextMatch: { type: "string" },
                      drill: { type: "string" }
                    },
                    required: ["name", "role", "position", "tag", "whatWorked", "whatFailed", "nextMatch", "drill"],
                    additionalProperties: false
                  }
                },
                teamReport: {
                  type: "object",
                  properties: {
                    turningPoint: { type: "string" },
                    strongestPartnership: { type: "string" },
                    bowlingInefficiency: { type: "string" },
                    scoringPattern: { type: "string" }
                  },
                  required: ["turningPoint", "strongestPartnership", "bowlingInefficiency", "scoringPattern"],
                  additionalProperties: false
                },
                coachBrief: {
                  type: "object",
                  properties: {
                    battingOrder: { type: "string" },
                    bowlingRotation: { type: "string" },
                    playerOnNotice: { type: "string" },
                    tacticalFocus: { type: "string" }
                  },
                  required: ["battingOrder", "bowlingRotation", "playerOnNotice", "tacticalFocus"],
                  additionalProperties: false
                }
              },
              required: ["players", "teamReport", "coachBrief"],
              additionalProperties: false
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || response.statusText;
      return new Response(JSON.stringify({ error: `Groq API error: ${errMsg}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Edge handler failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
