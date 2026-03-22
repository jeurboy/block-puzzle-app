import React, { useEffect } from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import GameCanvas from '../game/GameCanvas';
import { useGameStore } from '../store/gameStore';
import { createSeededRandom, todaySeed } from '../utils/seededRandom';

export default function DailyChallengeScreen() {
  const startDaily = useGameStore((s) => s.startDaily);
  const mode = useGameStore((s) => s.mode);
  const gameOver = useGameStore((s) => s.gameOver);

  useEffect(() => {
    const seed = todaySeed();
    const rng = createSeededRandom(seed);
    startDaily(rng);
  }, [startDaily]);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <ImageBackground source={require('../../assets/images/cute_bg.png')} style={{ flex: 1 }}>
      {/* Daily Challenge Badge */}
      <View className="items-center pt-8 pb-4">
        <Text className="text-slate-800 text-3xl font-bold tracking-tight">Daily Challenge</Text>
        <Text className="text-slate-500 text-sm mt-2">{today}</Text>
      </View>
      <GameCanvas />
    </ImageBackground>
  );
}
