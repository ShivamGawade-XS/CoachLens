import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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

You must return a JSON object matching this exact structure:
{
  "players": [
    {
      "name": "Player Name",
      "role": "Batsman/Bowler/Allrounder/Wicketkeeper",
      "position": "Key stat (e.g. '45 (30)' or '3/15 (4)') representing their match contribution",
      "tag": "Aggressor" | "Anchor" | "Improving" | "Liability",
      "whatWorked": "specific numbers-backed observation",
      "whatFailed": "specific numbers-backed critique",
      "nextMatch": "tactical focus instruction",
      "drill": "concrete practice drill recommendation"
    }
  ],
  "teamReport": {
    "turningPoint": "momentum shift description citing a specific over and numbers",
    "strongestPartnership": "partnership description with names and runs",
    "bowlingInefficiency": "bowler rotation/inefficiency critique with overs/economy",
    "scoringPattern": "team run scoring pattern observation"
  },
  "coachBrief": {
    "battingOrder": "batting order swap suggestion with reason",
    "bowlingRotation": "bowling changes recommendation with reason",
    "playerOnNotice": "name of player on notice with reason",
    "tacticalFocus": "core tactical focus for the next game"
  }
}

Generate player tags strictly from the enum list ["Aggressor", "Anchor", "Improving", "Liability"].`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    const ratelimit = new Ratelimit({
      redis: new Redis({ url: upstashUrl, token: upstashToken }),
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: false,
    });
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in an hour.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const { scorecard, format = 'T20', phase = 'Overall', tone = 'Direct' } = await req.json().catch(() => ({}));

  if (!scorecard) {
    return new Response(JSON.stringify({ error: 'Missing scorecard data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
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
        // Primary analysis uses the larger 70b model for deeper reasoning.
        // Lightweight tool features (groqService.js) use the faster 8b model (GROQ_MODEL constant).
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: scorecard }
        ],
        temperature: 0.3,
        stream: true,
        response_format: {
          type: "json_object"
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

    const reader = response.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8');
    let serverBuffer = '';
    let accumulatedText = '';

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;

            controller.enqueue(value);

            serverBuffer += decoder.decode(value, { stream: true });
            const lines = serverBuffer.split('\n');
            serverBuffer = lines.pop() || '';

            for (const line of lines) {
              const cleaned = line.trim();
              if (!cleaned) continue;
              if (cleaned === 'data: [DONE]') continue;
              if (cleaned.startsWith('data: ')) {
                try {
                  const parsed = JSON.parse(cleaned.slice(6));
                  const content = parsed.choices[0]?.delta?.content || '';
                  if (content) {
                    accumulatedText += content;
                  }
                } catch (e) {
                  // Ignore partial parsing error
                }
              }
            }
          }

          if (serverBuffer) {
            const cleaned = serverBuffer.trim();
            if (cleaned && cleaned !== 'data: [DONE]' && cleaned.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(cleaned.slice(6));
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  accumulatedText += content;
                }
              } catch (e) {
                // Ignore partial parsing error
              }
            }
          }

          let shareId = null;
          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

          if (accumulatedText && supabaseUrl && supabaseAnonKey) {
            try {
              const fullAnalysis = JSON.parse(accumulatedText);
              const supabase = createClient(supabaseUrl, supabaseAnonKey);
              
              const extractTeams = (text) => {
                const vsMatch = text.match(/^(.+?)\s+(?:vs\.?|versus)\s+(.+?)(?:\s*[-–—]|\n)/im);
                if (vsMatch) return `${vsMatch[1].trim()} vs ${vsMatch[2].trim()}`;
                
                const inningsMatches = text.match(/^(.+?)\s+(?:innings|batting)/gim);
                if (inningsMatches && inningsMatches.length >= 2) {
                  const t1 = inningsMatches[0].replace(/\s*(innings|batting).*/i, '').trim();
                  const t2 = inningsMatches[1].replace(/\s*(innings|batting).*/i, '').trim();
                  return `${t1} vs ${t2}`;
                }
                return 'Team A vs Team B';
              };

              const matchLabel = extractTeams(scorecard);
              const { data: inserted, error: insertErr } = await supabase
                .from('analyses')
                .insert([{ match_label: matchLabel, full_analysis: fullAnalysis }])
                .select('id')
                .single();

              if (insertErr) {
                console.error("Supabase insert error:", insertErr);
              } else {
                shareId = inserted.id;
              }
            } catch (err) {
              console.error("Error saving to Supabase:", err);
            }
          }

          if (shareId) {
            controller.enqueue(encoder.encode(`\ndata: ${JSON.stringify({ shareId })}\n\n`));
          }
          controller.close();
        } catch (err) {
          console.error("Custom stream error:", err);
          controller.error(err);
        }
      }
    });

    return new Response(customStream, {
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
