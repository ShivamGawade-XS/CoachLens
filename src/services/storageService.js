import { FALLBACK_ANALYSES } from '../utils/fallbackData';

const STORAGE_KEY = 'coachlens_matches';
const SEEDED_KEY = 'coachlens_seeded';

export const storageService = {
  getMatches: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return [];
    }
  },
  
  saveMatch: async (matchRecord) => {
    try {
      const matches = await storageService.getMatches();
      const newMatch = {
        ...matchRecord,
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        date: new Date().toISOString()
      };
      
      const updatedMatches = [newMatch, ...matches];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMatches));
      return newMatch;
    } catch (e) {
      console.error('Error saving to localStorage', e);
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
      
      matches[index] = { ...matches[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
      return matches[index];
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

  seedDemoMatches: (userId) => {
    try {
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

      const existing = storageService.getMatches();
      const merged = [...demoMatches, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(SEEDED_KEY, 'true');

      // ── Seed Demo Teams ───────────────────────────────────────────────
      const teamsKey = `coachlens_teams_${userId || 'demo'}`;

      const existingTeams = (() => {
        try { return JSON.parse(localStorage.getItem(teamsKey) || '[]'); } catch { return []; }
      })();

      if (existingTeams.length === 0) {
        const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 2);
        const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 8);

        const demoTeams = [
          {
            id: 'demo-team-panthers',
            name: 'Panaji Panthers',
            emoji: '🐯',
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
              { name: 'Priya Singh',  role: 'Bowler',       jerseyNo: '17', phone: '' },
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
      // ─────────────────────────────────────────────────────────────────

      return true;
    } catch (e) {
      console.error('Error seeding demo matches', e);
      return false;
    }
  }
};
