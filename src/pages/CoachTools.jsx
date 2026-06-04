import React, { useState } from 'react';
import { Target, GitCompare, Radio, Shield, Crosshair, Camera, Calendar, TrendingDown } from 'lucide-react';
import TargetScoreAdvisor from '../components/TargetScoreAdvisor/TargetScoreAdvisor';
import PlayerComparison from '../components/PlayerComparison/PlayerComparison';
import LiveMatchAssistant from '../components/LiveMatchAssistant/LiveMatchAssistant';
import BestXISelector from '../components/BestXISelector/BestXISelector';
import ShotWeaknessMapper from '../components/ShotWeaknessMapper/ShotWeaknessMapper';
import ScorecardScanner from '../components/ScorecardScanner/ScorecardScanner';
import SquadRotationPlanner from '../components/SquadRotationPlanner/SquadRotationPlanner';
import ChokeDetector from '../components/ChokeDetector/ChokeDetector';
import ErrorBoundary from '../components/ErrorBoundary';

const tools = [
  { key: 'live', label: 'Live Assistant', icon: <Radio size={18} />, description: 'Ball-by-ball dugout mode' },
  { key: 'target', label: 'Target Score', icon: <Target size={18} />, description: 'Live par score calculator' },
  { key: 'bestxi', label: 'Best XI', icon: <Shield size={18} />, description: 'AI squad selection' },
  { key: 'compare', label: 'Player Compare', icon: <GitCompare size={18} />, description: 'Head-to-head metrics' },
  { key: 'weakness', label: 'Shot Weakness', icon: <Crosshair size={18} />, description: 'Dismissal patterns' },
  { key: 'rotate', label: 'Rotation Planner', icon: <Calendar size={18} />, description: 'Tournament workload' },
  { key: 'choke', label: 'Choke Detector', icon: <TrendingDown size={18} />, description: 'Big match dropoffs' },
  { key: 'scanner', label: 'Scorecard Scanner', icon: <Camera size={18} />, description: 'OCR photo extract' },
];

export default function CoachTools() {
  const [activeTool, setActiveTool] = useState('live');

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display-xl font-display text-textPrimary mb-2">Coach Tools</h1>
        <p className="text-textSecondary text-sm">Live match utilities and decision-making tools for match day.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Tool Selector */}
        <div className="w-full flex flex-row overflow-x-auto pb-4 gap-2 flex-nowrap scrollbar-none sm:flex-col sm:overflow-visible sm:pb-0 lg:w-64 lg:shrink-0">
          {tools.map(tool => (
            <button
              key={tool.key}
              onClick={() => setActiveTool(tool.key)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-mono transition-all border shrink-0 sm:shrink ${
                activeTool === tool.key
                  ? 'bg-accent/10 text-accent border-accent/20 font-bold shadow-glow-accent'
                  : 'bg-surface2 text-textSecondary border-border hover:text-textPrimary hover:bg-surface3'
              } flex-shrink-0 w-48 sm:w-full`}
            >
              <div className="shrink-0">{tool.icon}</div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm truncate">{tool.label}</div>
                <div className={`text-[10px] font-mono truncate ${activeTool === tool.key ? 'text-accent/70' : 'text-textTertiary'}`}>{tool.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="flex-1 w-full max-w-3xl">
          <ErrorBoundary>
            {activeTool === 'live' && <LiveMatchAssistant />}
            {activeTool === 'target' && <TargetScoreAdvisor />}
            {activeTool === 'bestxi' && <BestXISelector />}
            {activeTool === 'compare' && <PlayerComparison />}
            {activeTool === 'weakness' && <ShotWeaknessMapper />}
            {activeTool === 'rotate' && <SquadRotationPlanner />}
            {activeTool === 'choke' && <ChokeDetector />}
            {activeTool === 'scanner' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Camera size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-display text-textPrimary">Scorecard Photo Scanner</h2>
                    <p className="text-xs text-textTertiary font-mono">OPTICAL CHARACTER RECOGNITION (OCR)</p>
                  </div>
                </div>
                <ScorecardScanner />
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
