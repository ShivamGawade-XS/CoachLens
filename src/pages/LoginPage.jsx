import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) return setError('Email is required.');
    if (!form.password) return setError('Password is required.');

    setIsSubmitting(true);

    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Failed to sign in. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden px-4">
      {/* Ambient background */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-aggressor-bg/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <img src="/logo.png" alt="CoachLens" className="h-10 mx-auto object-contain dark:brightness-100 brightness-0" />
          </Link>
          <h1 className="text-3xl font-display text-textPrimary mb-2">Welcome back</h1>
          <p className="text-textSecondary text-sm font-mono">Sign in to continue to your coaching dashboard</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-liability-bg/50 border border-liability-border text-liability-text text-sm animate-scale-pop">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="coach@example.com"
                className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 pr-12 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textPrimary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-textTertiary uppercase font-mono tracking-widest">New here?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Signup Link */}
          <Link
            to="/signup"
            className="w-full flex items-center justify-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary py-3 rounded-xl text-sm font-mono font-medium transition-all"
          >
            Create a Coach Account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-textTertiary mt-6 font-mono">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-accent hover:text-accentHover underline">Terms</Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-accent hover:text-accentHover underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
