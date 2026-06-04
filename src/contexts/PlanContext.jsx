import { createContext } from 'react';

/**
 * Provides plan/billing state (isPaid, hasHitLimit, openUpgradeModal, etc.)
 * to the entire app tree. Populated in App.jsx via usePlan() + modal handlers.
 */
const PlanContext = createContext(null);

export default PlanContext;
