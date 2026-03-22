import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function UndoButton() {
  const undo = useGameStore((s) => s.undo);
  const undosRemaining = useGameStore((s) => s.undosRemaining);
  const previousState = useGameStore((s) => s.previousState);
  const isAnimating = useGameStore((s) => s.isAnimating);

  const disabled = !previousState || undosRemaining <= 0 || isAnimating;

  return (
    <Pressable
      onPress={undo}
      disabled={disabled}
      className={`flex-row items-center px-4 py-2 rounded-xl ${
        disabled ? 'bg-zinc-800' : 'bg-zinc-700'
      }`}
    >
      <Text className={`text-sm font-semibold ${disabled ? 'text-zinc-600' : 'text-white'}`}>
        Undo
      </Text>
      <View
        className={`px-4 py-2 rounded-full border flex-row items-center justify-center ${
          disabled ? 'bg-black/5 border-transparent' : 'bg-white/60 border-white/50'
        }`}
      >
        <Text className={`text-sm font-semibold ${disabled ? 'text-slate-400' : 'text-slate-800'}`}>
          {undosRemaining}
        </Text>
      </View>
    </Pressable>
  );
}
