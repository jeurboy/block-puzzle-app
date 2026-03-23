import { useEffect, useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useSoundStore } from '../store/soundStore';

const placeSfx = require('../../assets/sounds/place.wav');
const clearSfx = require('../../assets/sounds/clear.wav');
const comboSfx = require('../../assets/sounds/combo.wav');
const gameoverSfx = require('../../assets/sounds/gameover.wav');

export function useSound() {
  const sfxEnabled = useSoundStore((s) => s.sfxEnabled);

  const placePlayer = useAudioPlayer(placeSfx);
  const clearPlayer = useAudioPlayer(clearSfx);
  const comboPlayer = useAudioPlayer(comboSfx);
  const gameoverPlayer = useAudioPlayer(gameoverSfx);

  const playPlace = useCallback(() => {
    if (!sfxEnabled) return;
    placePlayer.seekTo(0);
    placePlayer.play();
  }, [placePlayer, sfxEnabled]);

  const playClear = useCallback(() => {
    if (!sfxEnabled) return;
    clearPlayer.seekTo(0);
    clearPlayer.play();
  }, [clearPlayer, sfxEnabled]);

  const playCombo = useCallback(() => {
    if (!sfxEnabled) return;
    comboPlayer.seekTo(0);
    comboPlayer.play();
  }, [comboPlayer, sfxEnabled]);

  const playGameOver = useCallback(() => {
    if (!sfxEnabled) return;
    gameoverPlayer.seekTo(0);
    gameoverPlayer.play();
  }, [gameoverPlayer, sfxEnabled]);

  return { playPlace, playClear, playCombo, playGameOver };
}

const bgmSource = require('../../assets/sounds/bgm.wav');

export function useBGM(shouldPlay: boolean) {
  const bgmEnabled = useSoundStore((s) => s.bgmEnabled);
  const bgmPlayer = useAudioPlayer(bgmSource);

  useEffect(() => {
    bgmPlayer.loop = true;
    bgmPlayer.volume = 0.3;
  }, [bgmPlayer]);

  useEffect(() => {
    if (shouldPlay && bgmEnabled) {
      bgmPlayer.play();
    } else {
      bgmPlayer.pause();
    }
  }, [shouldPlay, bgmEnabled, bgmPlayer]);

  return bgmPlayer;
}
