import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'block_puzzle_high_score';
const DAILY_SCORE_KEY_PREFIX = 'block_puzzle_daily_';
const PLAYER_NAME_KEY = 'block_puzzle_player_name';

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
