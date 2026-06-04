export const config = { runtime: 'edge' };

/**
 * POST /api/redeem
 * Body: { code: string }
 * Returns: { valid: true, token: string } or { valid: false, error: string }
 *
 * The token is an HMAC-SHA256 signed string that the client stores.
 * Server validates the code against PROMO_CODE env var.
 * Token = base64(payload) + '.' + base64(hmac signature)
 */
export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { code } = await req.json().catch(() => ({}));
  if (!code) {
    return new Response(JSON.stringify({ valid: false, error: 'No code provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const serverCode = process.env.PROMO_CODE;
  if (!serverCode) {
    return new Response(JSON.stringify({ valid: false, error: 'Promo system not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Case-insensitive comparison
  if (code.trim().toUpperCase() !== serverCode.trim().toUpperCase()) {
    return new Response(JSON.stringify({ valid: false, error: 'Invalid promo code' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // PLAN_SECRET is a dedicated signing key — never fall back to other API keys.
  const secret = process.env.PLAN_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ valid: false, error: 'Plan signing key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const payload = JSON.stringify({
    plan: 'team',
    grantedAt: Date.now(),
    // Token valid for 1 year (ms)
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
  });

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(payload));
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const payloadBase64 = btoa(payload);
  const token = `${payloadBase64}.${sigBase64}`;

  return new Response(JSON.stringify({ valid: true, token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
