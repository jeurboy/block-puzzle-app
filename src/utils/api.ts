const API_BASE = 'https://api.blockpuzzle.example.com'; // TODO: Replace with actual backend URL

export type LeaderboardEntry = {
  rank: number;
  playerName: string;
  score: number;
  date?: string;
};

export async function submitScore(
  playerName: string,
  score: number,
  isDaily: boolean = false,
  date?: string
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, score, isDaily, date }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function getLeaderboard(
  type: 'all' | 'daily' = 'all',
  limit: number = 50,
  date?: string
): Promise<LeaderboardEntry[]> {
  try {
    const params = new URLSearchParams({ type, limit: String(limit) });
    if (date) params.set('date', date);
    const res = await fetch(`${API_BASE}/api/leaderboard?${params}`);
    return await res.json();
  } catch {
    return [];
  }
}
