import React, { useState, useEffect } from 'react';

export default function Settings({ addToast }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('GROQ_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveProfile = () => {
    addToast('Profile updated', 'success');
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim() === '') {
      localStorage.removeItem('GROQ_API_KEY');
      addToast('API key removed. Using fallback data.', 'warning');
    } else {
      localStorage.setItem('GROQ_API_KEY', apiKey.trim());
      addToast('API key saved successfully', 'success');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-display text-textPrimary">Settings</h1>
        <p className="text-textSecondary text-sm mt-1">Manage your coaching profile and application preferences.</p>
      </header>
      
      <div className="space-y-6">
        {/* Profile Settings */}
        <section className="glass-card rounded-xl p-6">
          <h2 className="text-sm uppercase tracking-wider font-medium text-textPrimary mb-4">Profile Information</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono text-textSecondary mb-1.5">Coach Name</label>
              <input 
                type="text" 
                defaultValue="Ashwith Ashok Shetty"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-textSecondary mb-1.5">Team Identity</label>
              <input 
                type="text" 
                defaultValue="Crimson Syndicate"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="pt-2">
              <button 
                onClick={handleSaveProfile}
                className="bg-accent text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-accentHover transition-colors"
              >
                Save Profile
              </button>
            </div>
          </div>
        </section>

        {/* API Settings */}
        <section className="glass-card rounded-xl p-6 border-l-4 border-l-aggressor-text">
          <h2 className="text-sm uppercase tracking-wider font-medium text-textPrimary mb-2 flex items-center gap-2">
            API Configuration
          </h2>
          <p className="text-xs text-textSecondary mb-4">
            Enter your Groq API key to unlock real-time Llama-3 match analysis. If empty, the app uses local demo data.
          </p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono text-textSecondary mb-1.5">Groq API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-aggressor-text transition-colors font-mono"
              />
            </div>
            <div className="pt-2">
              <button 
                onClick={handleSaveApiKey}
                className="bg-aggressor-bg text-aggressor-text border border-aggressor-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface3 transition-colors"
              >
                Save API Key
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
