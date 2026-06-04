import React, { useState, useCallback, createContext, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { usePlan } from './hooks/usePlan';

export const PlanContext = createContext(null);

// Auth
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts (always needed, not lazy)
import PublicLayout from './components/Layout/PublicLayout';
import AppLayout from './components/Layout/AppLayout';

// Eagerly loaded (above-fold critical path)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Lazy-loaded pages (split heavy chunks)
const Dashboard      = lazy(() => import('./components/Dashboard/Dashboard'));
const AnalysisFlow   = lazy(() => import('./pages/AnalysisFlow'));
const MatchResults   = lazy(() => import('./pages/MatchResults'));
const TeamProfile    = lazy(() => import('./pages/TeamProfile'));
const PlayerProfile  = lazy(() => import('./pages/PlayerProfile'));
const TeamRankings   = lazy(() => import('./pages/TeamRankings'));
const CoachTools     = lazy(() => import('./pages/CoachTools'));
const ShareView      = lazy(() => import('./pages/ShareView'));
const PublicPlayerCard = lazy(() => import('./pages/PublicPlayerCard'));
const AppPages       = lazy(() => import('./pages/AppPages'));
const ChatAssistant  = lazy(() => import('./components/ChatAssistant/ChatAssistant'));
const UpgradeModal   = lazy(() => import('./components/UpgradeModal/UpgradeModal'));
const PromoModal     = lazy(() => import('./components/PromoModal/PromoModal'));

// Legal & Marketing (rarely visited)
const LegalPages     = lazy(() => import('./pages/LegalPages'));
const MarketingPages = lazy(() => import('./pages/MarketingPages'));

// Page-level fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

/* ─── Global Toast System ─── */
function Toast({ message, type = 'info', onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 200);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-aggressor-border bg-aggressor-bg text-aggressor-text',
    error: 'border-liability-border bg-liability-bg text-liability-text',
    warning: 'border-improving-border bg-improving-bg text-improving-text',
    info: 'border-anchor-border bg-anchor-bg text-anchor-text',
  };

  const icons = {
    success: <CheckCircle size={15} />,
    error: <AlertCircle size={15} />,
    warning: <AlertCircle size={15} />,
    info: <Info size={15} />,
  };

  return (
    <div className={`${exiting ? 'toast-exit' : 'toast'} flex items-center gap-3 px-4 py-3 rounded-xl border glass ${colors[type]} max-w-sm shadow-card`}>
      {icons[type]}
      <span className="text-sm font-mono flex-1">{message}</span>
      <button onClick={() => { setExiting(true); setTimeout(onClose, 200); }} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}

function App() {
  /** @type {[Array<{id: number, message: string, type: 'success'|'error'|'warning'|'info'}>, React.Dispatch<React.SetStateAction<Array<{id: number, message: string, type: 'success'|'error'|'warning'|'info'}>>>]} */
  const [toasts, setToasts] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const plan = usePlan();

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const planContext = {
    ...plan,
    openUpgradeModal: () => setShowUpgrade(true),
    openPromoModal: () => setShowPromo(true),
  };

  return (
    <PlanContext.Provider value={planContext}>
    <AuthProvider>
      <BrowserRouter>
        {/* Global Toasts */}
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
          {toasts.map(toast => (
            <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
          ))}
        </div>

        <Suspense fallback={null}>
          {showUpgrade && (
            <UpgradeModal
              onClose={() => setShowUpgrade(false)}
              onGetPlan={() => {
                window.open('https://wa.me/919999999999?text=Hi%2C%20I%27d%20like%20to%20get%20the%20CoachLens%20Team%20Plan%20%E2%80%94%20%E2%82%B999%2Fmonth', '_blank');
              }}
            />
          )}

          {showPromo && (
            <PromoModal
              onClose={() => setShowPromo(false)}
              onRedeem={(code) => {
                const ok = plan.redeemPromo(code);
                if (ok) addToast('🎉 Team Plan activated!', 'success');
                return ok;
              }}
            />
          )}

          <ChatAssistant />
        </Suspense>

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<LegalPages page="about" />} />
              <Route path="/privacy" element={<LegalPages page="privacy" />} />
              <Route path="/terms" element={<LegalPages page="terms" />} />
              <Route path="/features" element={<MarketingPages page="features" />} />
              <Route path="/pricing" element={<MarketingPages page="pricing" />} />
              <Route path="/changelog" element={<MarketingPages page="changelog" />} />
              <Route path="/docs" element={<MarketingPages page="docs" />} />
              <Route path="/api" element={<MarketingPages page="api" />} />
              <Route path="/community" element={<MarketingPages page="community" />} />
              <Route path="/blog" element={<MarketingPages page="blog" />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/card" element={<PublicPlayerCard />} />
            <Route path="/share/:id" element={<ShareView />} />

            {/* Authenticated App Routes */}
            <Route element={<ProtectedRoute><AppLayout addToast={addToast} /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analyze" element={<AnalysisFlow addToast={addToast} />} />
              <Route path="/match/:id" element={<MatchResults />} />
              <Route path="/teams" element={<AppPages page="teams" addToast={addToast} />} />
              <Route path="/teams/:teamId" element={<TeamProfile />} />
              <Route path="/player/:playerName" element={<PlayerProfile />} />
              <Route path="/settings" element={<AppPages page="settings" addToast={addToast} />} />
              <Route path="/tools" element={<CoachTools />} />
              <Route path="/rankings" element={<TeamRankings />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
    </PlanContext.Provider>
  );
}

export default App;

