import React, { useState, useEffect, useMemo } from 'react';
import { TrendingDown, AlertTriangle, Trophy, Search } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function ChokeDetector() {
  const [allMatches, setAllMatches] = useState([]);
  const [knockoutIds, setKnockoutIds] = useState(new Set());
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    const load = async () => {
      const matches = await storageService.getMatches();
      setAllMatches(matches);
      
      // Auto-detect knockouts from opponent/team name
      const autoKnockouts = new Set();
      matches.forEach(m => {
        const text = `${m.opponent} ${m.teamName}`.toLowerCase();
        if (text.includes('final') || text.includes('knockout') || text.includes('semi') || text.includes('quarter') || text.includes('qf') || text.includes('sf')) {
          autoKnockouts.add(m.id);
        }
      });
      setKnockoutIds(autoKnockouts);
    };
    load();
  }, []);

  const toggleKnockout = (id) => {
    const next = new Set(knockoutIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setKnockoutIds(next);
  };

  const analysis = useMemo(() => {
    if (allMatches.length === 0) return [];

    const playerStats = {};

    allMatches.forEach(m => {
      const isKnockout = knockoutIds.has(m.id);
      (m.analysis?.players || []).forEach(p => {
        if (!playerStats[p.name]) {
          playerStats[p.name] = {
            name: p.name,
            role: p.role,
            league: { matches: 0, totalImpact: 0, runs: 0, balls: 0, innings: 0 },
            knockout: { matches: 0, totalImpact: 0, runs: 0, balls: 0, innings: 0 }
          };
        }

        const statObj = isKnockout ? playerStats[p.name].knockout : playerStats[p.name].league;
        statObj.matches++;
        statObj.totalImpact += parseFloat(p.match_impact || 0);

        // Parse runs/balls for simple batting avg approximation
        const matchStr = p.key_stat?.match(/(\d+)\s*\((\d+)\)/);
        if (matchStr) {
          statObj.runs += parseInt(matchStr[1]);
          statObj.balls += parseInt(matchStr[2]);
          statObj.innings++;
        }
      });
    });

    // Calculate drops
    const results = [];
    Object.values(playerStats).forEach(p => {
      if (p.league.matches > 0 && p.knockout.matches > 0) {
        const leagueImpact = p.league.totalImpact / p.league.matches;
        const knockoutImpact = p.knockout.totalImpact / p.knockout.matches;
        const impactDrop = leagueImpact - knockoutImpact;
        
        const leagueAvg = p.league.innings > 0 ? (p.league.runs / p.league.innings).toFixed(1) : '--';
        const knockoutAvg = p.knockout.innings > 0 ? (p.knockout.runs / p.knockout.innings).toFixed(1) : '--';
        
        // Only include if there's a significant drop
        if (impactDrop >= 1.5 || (leagueAvg !== '--' && knockoutAvg !== '--' && parseFloat(leagueAvg) - parseFloat(knockoutAvg) > 10)) {
          results.push({
            ...p,
            leagueImpact: leagueImpact.toFixed(1),
            knockoutImpact: knockoutImpact.toFixed(1),
            impactDrop: impactDrop.toFixed(1),
            leagueAvg,
            knockoutAvg,
            severity: impactDrop >= 3 ? 'high' : 'medium'
          });
        }
      }
    });

    return results.sort((a, b) => parseFloat(b.impactDrop) - parseFloat(a.impactDrop));
  }, [allMatches, knockoutIds]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-liability-bg border border-liability-border flex items-center justify-center text-liability-text">
          <TrendingDown size={20} />
        </div>
        <div>
          <h2 className="text-lg font-display text-textPrimary">Choke Detector</h2>
          <p className="text-xs text-textTertiary font-mono">BIG MATCH PRESSURE • STATISTICAL DROPOFFS</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-textSecondary">Match Classification</span>
            <p className="text-sm text-textPrimary">{knockoutIds.size} Knockout Matches • {allMatches.length - knockoutIds.size} League Matches</p>
          </div>
          <button onClick={() => setIsConfiguring(!isConfiguring)} className="px-4 py-2 rounded-xl bg-surface2 hover:bg-surface3 border border-border text-xs font-mono text-textPrimary transition-all">
            {isConfiguring ? 'Done' : 'Configure Matches'}
          </button>
        </div>

        {isConfiguring && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar mb-4 bg-primary/30 p-4 rounded-xl border border-border/50">
            {allMatches.map(m => (
              <label key={m.id} className="flex items-center justify-between p-2 hover:bg-surface2 rounded-lg cursor-pointer transition-colors">
                <div>
                  <span className="text-sm font-display text-textPrimary">{m.teamName} vs {m.opponent}</span>
                  <span className="text-xs font-mono text-textTertiary ml-2">{new Date(m.date).toLocaleDateString()}</span>
                </div>
                <input type="checkbox" checked={knockoutIds.has(m.id)} onChange={() => toggleKnockout(m.id)} className="w-4 h-4 accent-accent" />
              </label>
            ))}
          </div>
        )}
      </div>

      {analysis.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          {analysis.map((p, i) => (
            <div key={i} className={`glass-card rounded-2xl overflow-hidden border-l-4 ${p.severity === 'high' ? 'border-l-liability-text' : 'border-l-accent'}`}>
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display text-textPrimary text-lg">{p.name}</h3>
                  <p className="text-xs font-mono text-textSecondary">{p.role}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider border ${p.severity === 'high' ? 'bg-liability-bg text-liability-text border-liability-border' : 'bg-accent/10 text-accent border-accent/20'}`}>
                  {p.severity === 'high' ? 'Severe Dropoff' : 'Noticeable Dropoff'}
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-3 flex items-center gap-1">League Matches ({p.league.matches})</div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-display text-textPrimary">{p.leagueImpact}</span>
                    <span className="text-xs font-mono text-textSecondary">avg impact</span>
                  </div>
                  {p.leagueAvg !== '--' && <div className="text-xs font-mono text-textSecondary">~{p.leagueAvg} runs/inning</div>}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-mono text-textTertiary mb-3 flex items-center gap-1"><Trophy size={12}/> Knockout Matches ({p.knockout.matches})</div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-display text-liability-text">{p.knockoutImpact}</span>
                    <span className="text-xs font-mono text-textSecondary">avg impact</span>
                  </div>
                  {p.knockoutAvg !== '--' && <div className="text-xs font-mono text-liability-text">~{p.knockoutAvg} runs/inning</div>}
                </div>
              </div>
              <div className="px-6 py-4 bg-surface2/50 border-t border-border">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className={p.severity === 'high' ? 'text-liability-text' : 'text-accent'} style={{ marginTop: '2px' }} />
                  <p className="text-sm text-textPrimary leading-relaxed">
                    <strong>Coach Note:</strong> {p.name}&apos;s impact drops by <strong>{p.impactDrop} points</strong> in knockout matches. 
                    {p.leagueAvg !== '--' && p.knockoutAvg !== '--' ? ` Scoring drops from ~${p.leagueAvg} to ~${p.knockoutAvg}. ` : ' '}
                    {p.severity === 'high' ? 'Do not rely on them in high-pressure situations or demote them down the order.' : 'Monitor their pressure handling and consider specialized mental conditioning.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center mx-auto mb-4 text-textTertiary">
            <Search size={24} />
          </div>
          <p className="text-textSecondary font-mono text-sm">No significant big-match chokers detected.</p>
          <p className="text-textTertiary font-mono text-xs mt-2">Make sure you have enough data for both League and Knockout matches.</p>
        </div>
      )}
    </div>
  );
}
