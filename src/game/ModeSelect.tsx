import React from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useGameStore } from '../store/gameStore';

const MODES = [
  {
    key: 'classic' as const,
    title: 'Classic',
    subtitle: '3 blocks — classic strategy',
    colors: ['#4facfe', '#00f2fe'] as [string, string],
    action: 'startClassic',
  },
  {
    key: 'crazy' as const,
    title: 'Crazy',
    subtitle: '1 block + sabotage blocks!',
    colors: ['#ff0844', '#ffb199'] as [string, string],
    action: 'startCrazy',
  },
  {
    key: 'time-trial' as const,
    title: 'Time Trial',
    subtitle: '6 seconds per block',
    colors: ['#f6d365', '#fda085'] as [string, string],
    action: 'startTimeTrial',
  },
] as const;

export default function ModeSelect() {
  const startClassic = useGameStore((s) => s.startClassic);
  const startCrazy = useGameStore((s) => s.startCrazy);
  const startTimeTrial = useGameStore((s) => s.startTimeTrial);

  const actions = {
    startClassic,
    startCrazy,
    startTimeTrial,
  } as const;

  return (
    <ImageBackground
      source={require('../../assets/images/cute_bg.png')}
      style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}
    >
      <View className="items-center justify-center mb-10">
        <Image
          source={require('../../assets/images/mascot.png')}
          style={{ width: 140, height: 140, marginBottom: 16 }}
          contentFit="contain"
        />
        <Text className="text-indigo-900 text-5xl font-fredoka tracking-wide text-center mb-2">
          Block Puzzle
        </Text>
        <Text className="text-slate-500 text-lg font-medium text-center">
          Choose a mode to play
        </Text>
      </View>

      <View style={{ gap: 16, paddingHorizontal: 4 }}>
        {MODES.map((mode) => (
          <Pressable
            key={mode.key}
            onPress={actions[mode.action]}
            className="active:opacity-80"
          >
            <LinearGradient
              colors={mode.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 24,
                paddingHorizontal: 24,
                borderRadius: 24,
                shadowColor: mode.colors[0],
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white text-3xl font-fredoka tracking-wide mb-1">
                    {mode.title}
                  </Text>
                  <Text className="text-white/80 text-base font-semibold">
                    {mode.subtitle}
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/30">
                  <Text className="text-white font-bold text-2xl">›</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
    </ImageBackground>
  );
}
