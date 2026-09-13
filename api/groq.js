import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Rate Limiting
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    const ratelimit = new Ratelimit({
      redis: new Redis({ url: upstashUrl, token: upstashToken }),
      limiter: Ratelimit.slidingWindow(60, '1 h'),
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

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Groq API key not configured on server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.clone().json();
    if (!body || !body.messages) {
      return new Response(JSON.stringify({ error: 'Missing request messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const requestedModel = body.model || process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    const candidateModels = [...new Set([
      requestedModel,
      process.env.GROQ_MODEL,
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile'
    ].filter(Boolean))];

    let response = null;
    let lastErrorMsg = '';

    for (const model of candidateModels) {
      const payload = { ...body, model };
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        response = res;
        break;
      }

      const errClone = res.clone();
      const errData = await errClone.json().catch(() => null);
      lastErrorMsg = errData?.error?.message || res.statusText;
      console.warn(`Groq model ${model} failed in api/groq (${lastErrorMsg}). Trying next candidate...`);

      // If unauthorized (401), fail fast
      if (res.status === 401) {
        return new Response(JSON.stringify({ error: `Groq API error: ${lastErrorMsg}` }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (!response || !response.ok) {
      return new Response(JSON.stringify({ error: `Groq API error: ${lastErrorMsg || 'All candidate models failed'}` }), {
        status: response ? response.status : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
