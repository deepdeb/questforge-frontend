const API_BASE = '/api';

export interface PlayerProgress {
  level: number;
  xp: number;
  quests_completed: number;
  total_xp_earned: number;
  xp_to_next: number;
  username?: string;
}

export const playerAPI = {
  getProgress: async (): Promise<PlayerProgress> => {
    const res = await fetch(`${API_BASE}/player`);
    if (!res.ok) throw new Error('Failed to fetch progress');
    return res.json();
  },

  gainXP: async (amount: number = 25): Promise<{ progress: PlayerProgress }> => {
    const res = await fetch(`${API_BASE}/player/gain-xp?amount=${amount}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to gain XP');
    return res.json();
  }
};

export const questAPI = {
  getQuests: async () => {
    const res = await fetch('/api/quests');
    if (!res.ok) throw new Error('Failed to fetch quests');
    return res.json();
  }
};