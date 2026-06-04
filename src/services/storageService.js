import { FALLBACK_ANALYSES } from '../utils/fallbackData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { linkAllPlayersFromAnalysis, seedDemoPlayers } from './playerService';
import { STORAGE_KEYS } from '../constants';

const getCurrentUserId = () => {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.id;
    }
  } catch {
    // Ignore parsing or missing item exceptions
  }
  return null;
};

const STORAGE_KEY = STORAGE_KEYS.MATCHES;
const SEEDED_KEY = STORAGE_KEYS.SEEDED;
const MIGRATION_KEY = STORAGE_KEYS.SAMPLE_PATCH;

// ── One-time migration: patch existing sample matches that are missing team_summary / coach_decisions ──
(function migrateSampleMatches() {
  if (localStorage.getItem(MIGRATION_KEY)) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const matches = JSON.parse(raw);
    let patched = false;

    const patchData = {
      turningPoints: [
        'Over 14 — 3 consecutive dot balls turned pressure into a collapse.',
        'Over 8 — Partnership of 52 runs in 4 overs set a strong platform.',
        'Over 17 — 2 wickets in the over swung the match decisively.',
        'Over 6 — Powerplay strike rate of 145 put opposition on the back foot.',
        'Over 19 — Yorker hat-trick sealed the death overs.'
      ],
      partnerships: [
        'Opener partnership — 68 runs in 8 overs. Strong start.',
        'Middle-order rescue — 54 runs between #4 and #5, overs 10–15.',
        '3rd wicket stand — 72 runs. Dominated the spin in the middle overs.',
        'Opening pair — 45 runs in powerplay. Aggressive intent from ball one.',
        'Finisher duo — 38 off last 18 balls. Crucial death-over acceleration.'
      ],
      bowlingNotes: [
        'Medium pacer leaked 42 runs in 3 overs (ER 14.0). No variation at death.',
        'Spinner conceded 3 boundaries in over 12. Overpitched repeatedly.',
        'None — bowling unit was clinical across all phases.',
        'Opening bowler went for 38 in 4 overs. Too short, no swing.',
        'Death bowler had ER 11.5 in final 2 overs. Needs yorker practice.'
      ],
      patterns: [
        'Team scores 60% of runs in middle overs. Powerplay SR needs improvement to 130+.',
        'Consistent death-over collapse: avg 22 runs in overs 16–20 across last 3 games.',
        'Strong when chasing — 4/5 wins came batting second. Prefer to field first.',
        'Top order contributes 70% of runs. Lower order needs better finishing.',
        'Bowling is strongest in overs 7–12. Use best spinners in this phase.'
      ],
      battingChanges: [
        'Promote the aggressive opener to #1. Current #3 drops to #5 due to low SR.',
        'No batting order changes needed — top 4 is settled and performing.',
        'Swap #3 and #5 — the finisher needs to come in earlier when chasing.',
        'Move the allrounder to #4. Provides stability if early wickets fall.',
        'Open with the pinch-hitter in powerplay-heavy matches.'
      ],
      bowlingChanges: [
        'Restrict medium pacer to 2 overs max in death. Use spinner at overs 16–17.',
        'Give the left-arm spinner 4 full overs — most economical in the squad.',
        'Rotate 3 seamers: 2 overs each in death instead of relying on one.',
        'No changes — bowling rotation worked well this match.',
        'Drop the part-timer from bowling. Use as pure batsman.'
      ],
      notices: [
        'Opener — 3 consecutive single-digit scores. One more failure = dropped.',
        'Spinner — ER above 10 in last 2 matches. Must improve or loses spot.',
        'No one on notice — squad is performing consistently.',
        '#5 batsman — SR of 85 in last 3 innings. Needs to accelerate or sit out.',
        'Allrounder — bowling has been expensive. Focus on batting role only.'
      ],
      tacticals: [
        'Target powerplay SR of 130+ for top 3. Execute or restructure.',
        'Death over finishing: must score 35+ in overs 16–20.',
        'Improve running between wickets — 8 dot balls from poor rotation last match.',
        'Set field for yorkers in death overs. No short balls after over 17.',
        'Maintain current template — execution was near-perfect.'
      ]
    };

    matches.forEach((m, idx) => {
      if (!m.analysis) return;
      const ts = m.analysis.team_summary;
      const cd = m.analysis.coach_decisions;
      const needsPatch = !ts || Object.keys(ts).length === 0 || !cd || Object.keys(cd).length === 0;
      if (!needsPatch) return;

      const i = idx % 5;
      if (!ts || Object.keys(ts).length === 0) {
        m.analysis.team_summary = {
          what_won_lost_match: patchData.turningPoints[i],
          strongest_partnership: patchData.partnerships[i],
          bowling_inefficiency: patchData.bowlingNotes[i],
          pattern: patchData.patterns[i]
        };
      }
      if (!cd || Object.keys(cd).length === 0) {
        m.analysis.coach_decisions = {
          batting_order_change: patchData.battingChanges[i],
          bowling_rotation: patchData.bowlingChanges[i],
          player_on_notice: patchData.notices[i],
          tactical_focus_next_game: patchData.tacticals[i]
        };
      }
      patched = true;
    });

    if (patched) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
    }
    localStorage.setItem(MIGRATION_KEY, 'true');
  } catch (e) {
    console.warn('Migration failed:', e);
  }
})();

export const storageService = {
  getMatches: async () => {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      const localMatches = localData ? JSON.parse(localData) : [];
      
      const userId = getCurrentUserId();
      if (isSupabaseConfigured() && userId) {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
          
        if (!error && data) {
          const dbMatches = data.map(m => ({
            id: m.id,
            date: m.date,
            format: m.format,
            phase: m.phase,
            teamName: m.team_name,
            opponent: m.opponent,
            result: m.result,
            rawScorecard: m.raw_scorecard,
            analysis: m.analysis,
            isDemo: m.is_demo,
            processingTime: m.processing_time
          }));
          
          // Merge to avoid losing local-only matches
          const merged = [...dbMatches];
          localMatches.forEach(lm => {
            if (!merged.some(mm => mm.id === lm.id)) {
              merged.push(lm);
            }
          });
          return merged;
        } else {
          console.warn("Supabase fetch failed or table missing, using local storage:", error);
        }
      }
      return localMatches;
    } catch (e) {
      console.error('Error reading from storage', e);
      return [];
    }
  },
  
  saveMatch: async (matchRecord) => {
    try {
      const userId = getCurrentUserId();
      const newMatch = {
        ...matchRecord,
        id: matchRecord.id || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
        date: matchRecord.date || new Date().toISOString()
      };
      
      // Save locally first
      const matches = await storageService.getMatches();
      const updatedMatches = [newMatch, ...matches.filter(m => m.id !== newMatch.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMatches));
      
      if (isSupabaseConfigured() && userId) {
        const { error } = await supabase
          .from('matches')
          .upsert({
            id: newMatch.id,
            user_id: userId,
            date: newMatch.date,
            format: newMatch.format,
            phase: newMatch.phase,
            team_name: newMatch.teamName,
            opponent: newMatch.opponent,
            result: newMatch.result,
            raw_scorecard: newMatch.rawScorecard,
            analysis: newMatch.analysis,
            is_demo: !!newMatch.isDemo,
            processing_time: newMatch.processingTime || 0
          });
        if (error) {
          console.warn("Supabase save warning:", error);
        }
      }

      // Auto-link player profiles to this analysis
      if (newMatch.analysis?.players) {
        const playerNames = newMatch.analysis.players
          .map((p) => p.name)
          .filter(Boolean);
        linkAllPlayersFromAnalysis(playerNames, newMatch.id);
      }

      return newMatch;
    } catch (e) {
      console.error('Error saving match', e);
      return null;
    }
  },
  
  getMatchById: async (id) => {
    const matches = await storageService.getMatches();
    return matches.find(m => m.id === id);
  },

  updateMatch: async (id, updates) => {
    try {
      const matches = await storageService.getMatches();
      const index = matches.findIndex(m => m.id === id);
      if (index === -1) return null;
      
      const updatedMatch = { ...matches[index], ...updates };
      matches[index] = updatedMatch;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
      
      const userId = getCurrentUserId();
      if (isSupabaseConfigured() && userId) {
        const { error } = await supabase
          .from('matches')
          .update({
            format: updatedMatch.format,
            phase: updatedMatch.phase,
            team_name: updatedMatch.teamName,
            opponent: updatedMatch.opponent,
            result: updatedMatch.result,
            raw_scorecard: updatedMatch.rawScorecard,
            analysis: updatedMatch.analysis,
            is_demo: !!updatedMatch.isDemo,
            processing_time: updatedMatch.processingTime || 0
          })
          .eq('id', id)
          .eq('user_id', userId);
        if (error) {
          console.warn("Supabase update warning:", error);
        }
      }
      return updatedMatch;
    } catch (e) {
      console.error('Error updating match', e);
      return null;
    }
  },

  deleteMatch: async (id) => {
    try {
      const matches = await storageService.getMatches();
      const filtered = matches.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      
      const userId = getCurrentUserId();
      if (isSupabaseConfigured() && userId) {
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) {
          console.warn("Supabase delete warning:", error);
        }
      }
      return true;
    } catch (e) {
      console.error('Error deleting match', e);
      return false;
    }
  },

  clearMatches: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SEEDED_KEY);
      return true;
    } catch (e) {
      console.error('Error clearing matches', e);
      return false;
    }
  },

  seedDemoMatches: async (userId) => {
    // Helper to generate a premium base64 SVG logo for Panaji Panthers
    const _generatePanthersLogo = () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="pantherBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#311042"/>
          </linearGradient>
          <linearGradient id="accentGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="40" fill="url(#pantherBg)"/>
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#accentGold)" stroke-width="4" stroke-dasharray="6 4"/>
        <path d="M70,80 L100,60 L130,80 L120,110 L100,125 L80,110 Z" fill="#d97706" opacity="0.3"/>
        <polygon points="65,75 80,50 90,70" fill="url(#accentGold)"/>
        <polygon points="135,75 120,50 110,70" fill="url(#accentGold)"/>
        <polygon points="80,90 95,95 90,85" fill="#fef08a"/>
        <polygon points="120,90 105,95 110,85" fill="#fef08a"/>
        <path d="M100,95 L95,110 L105,110 Z" fill="#1e1b4b"/>
        <path d="M90,120 Q100,130 110,120" stroke="url(#accentGold)" stroke-width="3" fill="none"/>
        <text x="100" y="170" text-anchor="middle" font-family="'Impact', Arial, sans-serif" font-weight="900" font-size="16" fill="url(#accentGold)" letter-spacing="2">PANTHERS</text>
      </svg>`;
      try {
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      } catch {
        return null;
      }
    };

    // Helper to generate a premium base64 SVG logo for Margao Strikers
    const _generateStrikersLogo = () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="strikersBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#1e1b4b"/>
          </linearGradient>
          <linearGradient id="accentYellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#eab308"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="40" fill="url(#strikersBg)"/>
        <circle cx="100" cy="100" r="85" fill="none" stroke="#38bdf8" stroke-width="3"/>
        <polygon points="120,40 70,110 100,110 80,165 135,95 105,95" fill="url(#accentYellow)"/>
        <text x="100" y="175" text-anchor="middle" font-family="'Impact', Arial, sans-serif" font-weight="900" font-size="16" fill="#38bdf8" letter-spacing="2">STRIKERS</text>
      </svg>`;
      try {
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      } catch {
        return null;
      }
    };

    try {
      // ── Seed/Patch Team Logos (always check/update to pre-populate existing accounts) ──
      const teamsKey = `${STORAGE_KEYS.TEAMS_PREFIX}${userId || 'demo'}`;
      const existingTeams = (() => {
        try { return JSON.parse(localStorage.getItem(teamsKey) || '[]'); } catch { return []; }
      })();

      if (existingTeams.length > 0) {
        let teamsUpdated = false;
        const updatedTeams = existingTeams.map((t) => {
          if (t.id === 'demo-team-panthers' && (!t.logo || !t.logo.startsWith('data:image/svg+xml'))) {
            teamsUpdated = true;
            return { ...t, logo: _generatePanthersLogo() };
          }
          if (t.id === 'demo-team-strikers' && (!t.logo || !t.logo.startsWith('data:image/svg+xml'))) {
            teamsUpdated = true;
            return { ...t, logo: _generateStrikersLogo() };
          }
          return t;
        });

        if (teamsUpdated) {
          localStorage.setItem(teamsKey, JSON.stringify(updatedTeams));
        }
      }
      // ─────────────────────────────────────────────────────────────────────────────────

      const alreadySeeded = localStorage.getItem(SEEDED_KEY);
      if (alreadySeeded) return false;

      const demoKeys = ['panaji_vs_margao', 'margao_vs_vasco', 'vasco_vs_ponda', 'panaji_vs_vasco', 'panaji_vs_ponda'];
      const now = new Date();
      
      const demoMatches = demoKeys.map((key, index) => {
        const data = FALLBACK_ANALYSES[key];
        const matchDate = new Date(now);
        matchDate.setDate(matchDate.getDate() - (index * 3 + 1));

        return {
          id: `demo-${key}`,
          date: matchDate.toISOString(),
          format: data.format,
          phase: data.phase,
          teamName: data.teamName,
          opponent: data.opponent,
          result: data.result,
          rawScorecard: data.rawScorecard,
          analysis: data.analysis,
          isDemo: true
        };
      });

      const existing = await storageService.getMatches();
      const merged = [...demoMatches, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(SEEDED_KEY, 'true');

      // ── Seed Demo Teams if missing ─────────────────────────────────────────
      if (existingTeams.length === 0) {
        const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 2);
        const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 8);

        const demoTeams = [
          {
            id: 'demo-team-panthers',
            name: 'Panaji Panthers',
            emoji: '🐯',
            logo: _generatePanthersLogo(),
            matches: 3,
            createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 15).toISOString(),
            roster: [
              { name: 'Vikas Patel',  role: 'Batsman',      jerseyNo: '7',  phone: '9876543210' },
              { name: 'Suresh Raina', role: 'Allrounder',   jerseyNo: '3',  phone: '9823456789' },
              { name: 'Rahul Sharma', role: 'Batsman',      jerseyNo: '11', phone: '9834567890' },
              { name: 'Dev Kumar',    role: 'Bowler',       jerseyNo: '22', phone: '9845678901' },
              { name: 'Karan Nair',   role: 'Batsman',      jerseyNo: '5',  phone: '9856789012' },
              { name: 'Rohit Menon',  role: 'Wicketkeeper', jerseyNo: '1',  phone: '9867890123' },
              { name: 'Arjun Das',    role: 'Bowler',       jerseyNo: '9',  phone: '' },
              { name: 'Priya Desai',  role: 'Bowler',       jerseyNo: '17', phone: '' },
              { name: 'Manish Tiwari', role: 'Allrounder', jerseyNo: '8',  phone: '' },
              { name: 'Sanjay Verma', role: 'Batsman',     jerseyNo: '4',  phone: '' },
              { name: 'Nikhil Rao',   role: 'Bowler',      jerseyNo: '19', phone: '' },
            ],
            schedule: [
              {
                id: 'sched-1',
                opponent: 'Vasco Vikings',
                date: tomorrow.toISOString().split('T')[0],
                time: '16:00',
                venue: 'Campal Ground, Panaji',
                format: 'T20',
              },
              {
                id: 'sched-2',
                opponent: 'Mapusa Mavericks',
                date: nextWeek.toISOString().split('T')[0],
                time: '09:00',
                venue: 'Mapusa Sports Complex',
                format: 'T20',
              },
            ],
          },
          {
            id: 'demo-team-strikers',
            name: 'Margao Strikers',
            emoji: '⚡',
            logo: _generateStrikersLogo(),
            matches: 2,
            createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString(),
            roster: [
              { name: 'Amit Dessai',   role: 'Batsman',    jerseyNo: '10', phone: '' },
              { name: 'Rajan Naik',    role: 'Bowler',     jerseyNo: '6',  phone: '' },
              { name: 'Santosh Gaude', role: 'Allrounder', jerseyNo: '14', phone: '' },
              { name: 'Deepak Kamat',  role: 'Batsman',    jerseyNo: '2',  phone: '' },
              { name: 'Vinod Salgaonkar', role: 'Wicketkeeper', jerseyNo: '1', phone: '' },
              { name: 'Prasad Naik',   role: 'Bowler',     jerseyNo: '18', phone: '' },
              { name: 'Laxman Velip',  role: 'Bowler',     jerseyNo: '23', phone: '' },
              { name: 'Ganesh Fal',    role: 'Batsman',    jerseyNo: '9',  phone: '' },
              { name: 'Mohan Sawant',  role: 'Allrounder', jerseyNo: '5',  phone: '' },
              { name: 'Sudin Harmalkar', role: 'Batsman',  jerseyNo: '12', phone: '' },
              { name: 'Kishor Dessai', role: 'Bowler',     jerseyNo: '21', phone: '' },
            ],
            schedule: [
              {
                id: 'sched-3',
                opponent: 'Ponda Warriors',
                date: nextWeek.toISOString().split('T')[0],
                time: '14:30',
                venue: 'Fatorda Stadium, Margao',
                format: 'ODI',
              },
            ],
          },
        ];

        localStorage.setItem(teamsKey, JSON.stringify(demoTeams));
      }
      // ───────────────────────────────────────────────────────────────────────

      // ── Seed Demo Players ──────────────────────────────────────────
      const demoMatchIds = demoKeys.map(k => `demo-${k}`);
      seedDemoPlayers(demoMatchIds);
      // ──────────────────────────────────────────────────────────────────

      return true;
    } catch (e) {
      console.error('Error seeding demo matches', e);
      return false;
    }
  },

  syncLocalDataToSupabase: async (userId) => {
    if (!isSupabaseConfigured() || !userId) return;
    
    // 1. Sync local teams
    try {
      const teamsKey = `${STORAGE_KEYS.TEAMS_PREFIX}${userId}`;
      const localTeamsRaw = localStorage.getItem(teamsKey);
      if (localTeamsRaw) {
        const localTeams = JSON.parse(localTeamsRaw);
        for (const team of localTeams) {
          await supabase
            .from('teams')
            .upsert({
              id: team.id,
              user_id: userId,
              name: team.name,
              emoji: team.emoji,
              logo: team.logo || null,
              roster: team.roster || [],
              schedule: team.schedule || [],
              created_at: team.createdAt || new Date().toISOString()
            });
        }
      }
    } catch (err) {
      console.warn("Failed to sync teams to Supabase:", err);
    }

    // 2. Sync local matches
    try {
      const localMatchesRaw = localStorage.getItem(STORAGE_KEY);
      if (localMatchesRaw) {
        const localMatches = JSON.parse(localMatchesRaw);
        for (const m of localMatches) {
          await supabase
            .from('matches')
            .upsert({
              id: m.id,
              user_id: userId,
              date: m.date || new Date().toISOString(),
              format: m.format,
              phase: m.phase,
              team_name: m.teamName,
              opponent: m.opponent,
              result: m.result,
              raw_scorecard: m.rawScorecard,
              analysis: m.analysis,
              is_demo: !!m.isDemo,
              processing_time: m.processingTime || 0
            });
        }
      }
    } catch (err) {
      console.warn("Failed to sync matches to Supabase:", err);
    }
  },

  syncTeamsToSupabase: async (userId, teams) => {
    if (!isSupabaseConfigured() || !userId) return;
    try {
      for (const team of teams) {
        await supabase
          .from('teams')
          .upsert({
            id: team.id,
            user_id: userId,
            name: team.name,
            emoji: team.emoji,
            logo: team.logo || null,
            roster: team.roster || [],
            schedule: team.schedule || [],
            created_at: team.createdAt || new Date().toISOString()
          });
      }
    } catch (err) {
      console.warn("Background teams sync failed:", err);
    }
  },

  fetchTeamsFromSupabase: async (userId) => {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', userId);
      
      if (!error && data) {
        const mappedTeams = data.map(t => ({
          id: t.id,
          name: t.name,
          emoji: t.emoji,
          logo: t.logo,
          roster: t.roster || [],
          schedule: t.schedule || [],
          createdAt: t.created_at
        }));
        return mappedTeams;
      }
    } catch (err) {
      console.warn("Failed to fetch teams from Supabase:", err);
    }
    return null;
  }
};
