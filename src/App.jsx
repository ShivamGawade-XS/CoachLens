import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

// Layouts
import PublicLayout from './components/Layout/PublicLayout';
import AppLayout from './components/Layout/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import AnalysisFlow from './pages/AnalysisFlow';
import MatchResults from './pages/MatchResults';
import { About, PrivacyPolicy, TermsOfService } from './pages/LegalPages';
import Teams, { Settings } from './pages/AppPages';

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <BrowserRouter>
      {/* Global Toasts */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Route>

        {/* Authenticated App Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<AnalysisFlow addToast={addToast} />} />
          <Route path="/match/:id" element={<MatchResults />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
