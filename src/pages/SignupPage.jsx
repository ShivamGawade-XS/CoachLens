import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle, User, Building2, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ROLES = ['Head Coach', 'Assistant Coach', 'Captain', 'Team Manager', 'Analyst'];
const EXPERIENCE = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

export default function SignupPage() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    role: 'Head Coach',
    experience: '1-3 years',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (form.fullName.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) return setError(err);
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    try {
      const result = await signup({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        organization: form.organization,
        role: form.role,
        experience: form.experience,
      });

      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-liability-text' };
    if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-improving-text' };
    return { level: 3, label: 'Strong', color: 'bg-aggressor-text' };
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Ambient background */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-accent/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-aggressor-bg/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="/logo.png" alt="CoachLens" className="h-10 mx-auto object-contain dark:brightness-100 brightness-0" />
          </Link>
          <h1 className="text-3xl font-display text-textPrimary mb-2">Create your account</h1>
          <p className="text-textSecondary text-sm font-mono">Set up your coaching profile in 2 simple steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-8 px-4">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-all duration-300 ${
              step >= 1 ? 'bg-accent text-white shadow-glow-amber' : 'bg-surface2 border border-border text-textTertiary'
            }`}>
              {step > 1 ? <CheckCircle size={14} /> : '1'}
            </div>
            <span className={`text-xs font-mono transition-colors ${step >= 1 ? 'text-textPrimary font-bold' : 'text-textTertiary'}`}>Account</span>
          </div>
          <div className={`h-px flex-1 transition-colors duration-500 ${step >= 2 ? 'bg-accent' : 'bg-border'}`} />
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className={`text-xs font-mono transition-colors ${step >= 2 ? 'text-textPrimary font-bold' : 'text-textTertiary'}`}>Profile</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-all duration-300 ${
              step >= 2 ? 'bg-accent text-white shadow-glow-amber' : 'bg-surface2 border border-border text-textTertiary'
            }`}>
              2
            </div>
          </div>
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

            {step === 1 ? (
              /* ─── STEP 1: Account Details ─── */
              <div className="space-y-5 animate-fade-in" key="step1">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest flex items-center gap-1.5">
                    <User size={10} /> Full Name
                  </label>
                  <input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Coach Shivam Gawade"
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Email Address</label>
                  <input
                    id="signup-email"
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
                  <label htmlFor="signup-password" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest flex items-center gap-1.5">
                    <Shield size={10} /> Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
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
                  {/* Strength Meter */}
                  {form.password && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-surface3'}`} />
                        ))}
                      </div>
                      <span className={`text-[10px] font-mono ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="signup-confirm" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="signup-confirm"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 pr-12 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textPrimary transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <span className="text-[10px] font-mono text-aggressor-text flex items-center gap-1">
                      <CheckCircle size={10} /> Passwords match
                    </span>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentHover text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
                >
                  Continue to Profile <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              /* ─── STEP 2: Profile Setup ─── */
              <div className="space-y-5 animate-fade-in" key="step2">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4 p-4 bg-surface2 rounded-xl border border-border">
                  <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-mono font-bold text-lg">
                    {form.fullName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-textPrimary">{form.fullName || 'Your Name'}</div>
                    <div className="text-[10px] text-textTertiary font-mono">{form.email}</div>
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <label htmlFor="signup-org" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest flex items-center gap-1.5">
                    <Building2 size={10} /> Organization / Academy
                  </label>
                  <input
                    id="signup-org"
                    name="organization"
                    type="text"
                    value={form.organization}
                    onChange={handleChange}
                    placeholder="AITD Cricket Academy (optional)"
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label htmlFor="signup-role" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Your Role</label>
                  <select
                    id="signup-role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label htmlFor="signup-exp" className="text-[10px] text-textSecondary uppercase font-mono tracking-widest">Coaching Experience</label>
                  <select
                    id="signup-exp"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
                  >
                    {EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center justify-center gap-2 bg-surface2 hover:bg-surface3 border border-border text-textPrimary py-3 px-5 rounded-xl text-sm font-mono font-medium transition-all"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accentHover disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-glow-amber btn-press"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-textSecondary mt-6 font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accentHover font-bold underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
