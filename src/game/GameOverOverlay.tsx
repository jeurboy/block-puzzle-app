import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function GameOverOverlay() {
  const score = useGameStore((s) => s.score);
  const mode = useGameStore((s) => s.mode);
  const restart = useGameStore((s) => s.restart);
  const backToMenu = useGameStore((s) => s.backToMenu);

  const isTimeTrial = mode === 'time-trial';

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/20">
      <View className="bg-white/95 p-8 rounded-3xl items-center shadow-2xl border border-white w-5/6 max-w-sm">
        <Text className="text-indigo-900 text-4xl font-fredoka mb-2">
          {isTimeTrial ? "Time's Up!" : 'Game Over!'}
        </Text>
        <Text className="text-slate-500 text-lg font-bold mb-6">Final Score: {score}</Text>
        
        <View style={{ gap: 10, width: '100%' }}>
          <Pressable
            onPress={restart}
            className="bg-sky-500 px-8 py-3 rounded-2xl active:bg-sky-600 w-full"
          >
            <Text className="text-white text-xl font-fredoka text-center">Play Again</Text>
          </Pressable>
          <Pressable
            onPress={backToMenu}
            className="bg-indigo-100 px-8 py-3 rounded-2xl active:bg-indigo-200 w-full mt-2"
          >
            <Text className="text-indigo-900 text-xl font-fredoka text-center">Change Mode</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
