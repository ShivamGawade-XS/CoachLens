const STORAGE_KEY = 'coachlens_matches';

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
  
  saveMatch: (matchRecord) => {
    try {
      const matches = storageService.getMatches();
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
  
  getMatchById: (id) => {
    const matches = storageService.getMatches();
    return matches.find(m => m.id === id);
  }
};
