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

  seedDemoMatches: () => {
    try {
      const alreadySeeded = localStorage.getItem(SEEDED_KEY);
      if (alreadySeeded) return false;

      const demoKeys = ['panaji_vs_margao', 'margao_vs_vasco', 'vasco_vs_ponda'];
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
      return true;
    } catch (e) {
      console.error('Error seeding demo matches', e);
      return false;
    }
  }
};
