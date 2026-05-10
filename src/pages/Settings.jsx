import React from 'react';

export default function Settings({ addToast }) {
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
                onClick={() => addToast('Profile updated', 'success')}
                className="bg-accent text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-accentHover transition-colors"
              >
                Save Profile
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
