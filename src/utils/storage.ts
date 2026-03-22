import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'block_puzzle_high_score';
const DAILY_SCORE_KEY_PREFIX = 'block_puzzle_daily_';
const PLAYER_NAME_KEY = 'block_puzzle_player_name';
const SCORE_HISTORY_KEY = 'block_puzzle_score_history';

export type ScoreRecord = {
  id: string;
  score: number;
  mode: string;
  level: number;
  date: string; // ISO string
};

export async function loadHighScore(): Promise<number> {
  const val = await AsyncStorage.getItem(HIGH_SCORE_KEY);
  return val ? parseInt(val, 10) : 0;
}

export async function saveHighScore(score: number): Promise<void> {
  await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score));
}

export async function loadDailyBest(dateKey: string): Promise<number> {
  const val = await AsyncStorage.getItem(DAILY_SCORE_KEY_PREFIX + dateKey);
  return val ? parseInt(val, 10) : 0;
}

export async function saveDailyBest(dateKey: string, score: number): Promise<void> {
  await AsyncStorage.setItem(DAILY_SCORE_KEY_PREFIX + dateKey, String(score));
}

export async function loadPlayerName(): Promise<string> {
  return (await AsyncStorage.getItem(PLAYER_NAME_KEY)) || '';
}

export async function savePlayerName(name: string): Promise<void> {
  await AsyncStorage.setItem(PLAYER_NAME_KEY, name);
}

export async function loadScoreHistory(): Promise<ScoreRecord[]> {
  const val = await AsyncStorage.getItem(SCORE_HISTORY_KEY);
  if (!val) return [];
  try {
    return JSON.parse(val) as ScoreRecord[];
  } catch {
    return [];
  }
}

export async function saveScoreRecord(record: Omit<ScoreRecord, 'id' | 'date'>): Promise<ScoreRecord> {
  const history = await loadScoreHistory();
  const newRecord: ScoreRecord = {
    ...record,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
  };
  history.unshift(newRecord);
  // Keep max 100 records
  const trimmed = history.slice(0, 100);
  await AsyncStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(trimmed));
  return newRecord;
}

/** Returns 1-based rank of the given score among all scores for the same mode */
export async function getScoreRank(score: number, mode: string): Promise<number> {
  const history = await loadScoreHistory();
  const modeScores = history
    .filter((r) => r.mode === mode)
    .map((r) => r.score)
    .sort((a, b) => b - a);
  const rank = modeScores.findIndex((s) => score >= s);
  return rank === -1 ? modeScores.length + 1 : rank + 1;
}
