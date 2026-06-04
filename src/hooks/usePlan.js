import { useState, useCallback } from 'react';

const FREE_LIMIT = 3;
const STORAGE_KEY_PAID = 'coachlens_is_paid';
const STORAGE_KEY_COUNT = 'coachlens_analysis_count';
const PROMO_CODE = 'COACH2026';

export function usePlan() {
  const [isPaid, setIsPaid] = useState(() => localStorage.getItem(STORAGE_KEY_PAID) === 'true');
  const [analysisCount, setAnalysisCount] = useState(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);
    return isNaN(stored) ? 0 : stored;
  });

  const incrementCount = useCallback(() => {
    setAnalysisCount(prev => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_KEY_COUNT, String(next));
      return next;
    });
  }, []);

  const redeemPromo = useCallback((code) => {
    if (code.trim().toUpperCase() === PROMO_CODE) {
      localStorage.setItem(STORAGE_KEY_PAID, 'true');
      setIsPaid(true);
      return true;
    }
    return false;
  }, []);

  const hasHitLimit = !isPaid && analysisCount >= FREE_LIMIT;

  return { isPaid, analysisCount, incrementCount, redeemPromo, hasHitLimit, FREE_LIMIT };
}
