// src/lib/api.ts
const API_BASE = '/api';

export interface PlayerProgress {
  level: number;
  xp: number;
  quests_completed: number;
  total_xp_earned: number;
  xp_to_next: number;
  username?: string;
  gold?: number;
  inventory?: string;
}

export const playerAPI = {
  getProgress: async (): Promise<PlayerProgress> => {
    const res = await fetch(`${API_BASE}/player`);
    if (!res.ok) throw new Error('Failed to fetch progress');
    return res.json();
  },

  gainXP: async (
    amount: number = 25, 
    questTitle: string = "", 
    goldReward: number = 0     // ← New parameter
  ): Promise<{ progress: PlayerProgress }> => {
    const url = new URL(`${API_BASE}/player/gain-xp`, window.location.origin);
    url.searchParams.append('amount', amount.toString());
    if (questTitle) url.searchParams.append('quest_title', questTitle);
    if (goldReward > 0) url.searchParams.append('gold_reward', goldReward.toString());

    const res = await fetch(url.toString(), { method: 'POST' });
    if (!res.ok) throw new Error('Failed to gain XP');
    return res.json();
  }
};

export const historyAPI = {
  getHistory: async () => {
    const res = await fetch('/api/history');
    if (!res.ok) throw new Error('Failed to fetch history');
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