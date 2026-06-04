import { useState, useCallback } from 'react';

const FREE_LIMIT = 3;
const STORAGE_KEY_TOKEN  = 'coachlens_plan_token';
const STORAGE_KEY_COUNT  = 'coachlens_analysis_count';

/**
 * Reads the stored plan token and checks if it's structurally valid
 * (non-expired, correct shape). Does NOT re-verify the HMAC client-side
 * (that would expose the secret). Server-side endpoints can verify if needed.
 */
function readStoredPlan() {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token) return false;
    const [payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));
    if (payload.plan !== 'team') return false;
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function usePlan() {
  const [isPaid, setIsPaid]         = useState(() => readStoredPlan());
  const [analysisCount, setCount]   = useState(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);
    return isNaN(stored) ? 0 : stored;
  });
  const [isRedeeming, setIsRedeeming] = useState(false);

  const incrementCount = useCallback(() => {
    setCount(prev => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_KEY_COUNT, String(next));
      return next;
    });
  }, []);

  /**
   * Calls /api/redeem server-side. Returns true on success, false on failure.
   * On success, stores the signed token — promo code never saved to localStorage.
   */
  const redeemPromo = useCallback(async (code) => {
    setIsRedeeming(true);
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });
      const data = await res.json();
      if (data.valid && data.token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        setIsPaid(true);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsRedeeming(false);
    }
  }, []);

  const hasHitLimit = !isPaid && analysisCount >= FREE_LIMIT;

  return { isPaid, analysisCount, incrementCount, redeemPromo, hasHitLimit, FREE_LIMIT, isRedeeming };
}
