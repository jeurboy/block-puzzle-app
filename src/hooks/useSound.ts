import { useCallback } from 'react';

// Sound disabled for now — will implement once expo-audio API is stable.
// Game works perfectly without sound.

const noop = () => {};

export function useSound() {
  return {
    playPlace: useCallback(noop, []),
    playClear: useCallback(noop, []),
    playGameOver: useCallback(noop, []),
  };
}
