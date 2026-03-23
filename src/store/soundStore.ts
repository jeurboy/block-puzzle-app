import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_KEY = 'block_puzzle_sound_enabled';
const BGM_KEY = 'block_puzzle_bgm_enabled';

type SoundState = {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
  loaded: boolean;
  toggleSfx: () => void;
  toggleBgm: () => void;
  loadSettings: () => Promise<void>;
};

export const useSoundStore = create<SoundState>((set, get) => ({
  sfxEnabled: true,
  bgmEnabled: true,
  loaded: false,

  loadSettings: async () => {
    const [sfx, bgm] = await Promise.all([
      AsyncStorage.getItem(SOUND_KEY),
      AsyncStorage.getItem(BGM_KEY),
    ]);
    set({
      sfxEnabled: sfx !== 'false',
      bgmEnabled: bgm !== 'false',
      loaded: true,
    });
  },

  toggleSfx: () => {
    const next = !get().sfxEnabled;
    set({ sfxEnabled: next });
    AsyncStorage.setItem(SOUND_KEY, String(next));
  },

  toggleBgm: () => {
    const next = !get().bgmEnabled;
    set({ bgmEnabled: next });
    AsyncStorage.setItem(BGM_KEY, String(next));
  },
}));
