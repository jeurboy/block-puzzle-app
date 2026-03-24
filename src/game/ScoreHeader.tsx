import React from 'react';
import { View, Text } from 'react-native';
import { useGameStore, GameMode } from '../store/gameStore';

const MODE_LABELS: Record<GameMode, string> = {
  classic: 'Classic',
  crazy: 'Crazy',
  'time-trial': 'Time Trial',
  daily: 'Daily',
};

export default function ScoreHeader() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const comboCount = useGameStore((s) => s.comboCount);
  const level = useGameStore((s) => s.level);
  const mode = useGameStore((s) => s.mode);

  return (
    <View className="items-center mb-4" style={{ marginTop: 80 }}>
      <View className="bg-white/85 px-8 py-5 rounded-[32px] items-center border-[4px] border-white shadow-sm w-full max-w-[320px]">
        <Text className="text-indigo-900 text-4xl font-fredoka tracking-wide">
          Block Puzzle
        </Text>
        <Text className="text-indigo-400/80 text-[10px] font-bold tracking-widest mt-1 mb-2 uppercase">
          {MODE_LABELS[mode]}
        </Text>

        <View className="flex-row items-center border-t border-indigo-100/60 pt-3 mt-1 w-full justify-between px-2">
          <View className="items-center">
            <Text className="text-slate-400 text-[10px] font-bold tracking-widest mb-1">SCORE</Text>
            <Text className="text-indigo-500 text-3xl font-fredoka">{score}</Text>
          </View>
          <View className="w-[2px] h-8 bg-indigo-50 rounded-full" />
          <View className="items-center">
            <Text className="text-slate-400 text-[10px] font-bold tracking-widest mb-1">BEST</Text>
            <Text className="text-amber-400 text-3xl font-fredoka">{highScore}</Text>
          </View>
          <View className="w-[2px] h-8 bg-indigo-50 rounded-full" />
          <View className="items-center">
            <Text className="text-slate-400 text-[10px] font-bold tracking-widest mb-1">LV</Text>
            <Text className="text-sky-400 text-3xl font-fredoka">{level}</Text>
          </View>
        </View>

        {comboCount >= 2 && (
          <View className="absolute -bottom-4 bg-amber-400 px-5 py-1.5 rounded-full border-4 border-white shadow-sm">
            <Text className="text-white text-xs font-black tracking-wider">
              COMBO x{comboCount}!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
