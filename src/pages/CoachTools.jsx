import React, { useState } from 'react';
import { Target, GitCompare } from 'lucide-react';
import TargetScoreAdvisor from '../components/TargetScoreAdvisor/TargetScoreAdvisor';
import PlayerComparison from '../components/PlayerComparison/PlayerComparison';

const tools = [
  { key: 'target', label: 'Target Score', icon: <Target size={18} />, description: 'Live par score calculator' },
  { key: 'compare', label: 'Player Compare', icon: <GitCompare size={18} />, description: 'Head-to-head metrics' },
];

export default function CoachTools() {
  const [activeTool, setActiveTool] = useState('target');

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display-xl font-display text-textPrimary mb-2">Coach Tools</h1>
        <p className="text-textSecondary text-sm">Live match utilities and decision-making tools for match day.</p>
      </div>

      {/* Tool Selector */}
      <div className="flex gap-3">
        {tools.map(tool => (
          <button
            key={tool.key}
            onClick={() => setActiveTool(tool.key)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-mono transition-all border ${
              activeTool === tool.key
                ? 'bg-accent/10 text-accent border-accent/20 font-bold shadow-[0_0_15px_rgba(232,160,32,0.1)]'
                : 'bg-surface2 text-textSecondary border-border hover:text-textPrimary hover:bg-surface3'
            }`}
          >
            {tool.icon}
            <div className="text-left">
              <div className="text-sm">{tool.label}</div>
              <div className={`text-[10px] font-mono ${activeTool === tool.key ? 'text-accent/70' : 'text-textTertiary'}`}>{tool.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="max-w-3xl">
        {activeTool === 'target' && <TargetScoreAdvisor />}
        {activeTool === 'compare' && <PlayerComparison />}
      </div>
    </div>
  );
}
