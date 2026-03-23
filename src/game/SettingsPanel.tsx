import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSoundStore } from '../store/soundStore';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const sfxEnabled = useSoundStore((s) => s.sfxEnabled);
  const bgmEnabled = useSoundStore((s) => s.bgmEnabled);
  const toggleSfx = useSoundStore((s) => s.toggleSfx);
  const toggleBgm = useSoundStore((s) => s.toggleBgm);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [open, anim]);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="bg-white/80 rounded-full w-9 h-9 items-center justify-center border border-white shadow-sm active:opacity-70"
      >
        <Ionicons name="settings-sharp" size={20} color="#312e81" />
      </Pressable>

      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          top: 44,
          right: 0,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 16,
          padding: 12,
          minWidth: 160,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          opacity: anim,
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
          ],
        }}
      >
        <Pressable
          onPress={toggleSfx}
          className="flex-row items-center justify-between py-2 active:opacity-70"
        >
          <Text className="text-indigo-900 text-sm font-bold">Sound FX</Text>
          <Ionicons
            name={sfxEnabled ? 'volume-high' : 'volume-mute'}
            size={20}
            color={sfxEnabled ? '#312e81' : '#94a3b8'}
          />
        </Pressable>

        <View className="h-px bg-slate-200 my-1" />

        <Pressable
          onPress={toggleBgm}
          className="flex-row items-center justify-between py-2 active:opacity-70"
        >
          <Text className="text-indigo-900 text-sm font-bold">Music</Text>
          <Ionicons
            name={bgmEnabled ? 'musical-notes' : 'musical-notes-outline'}
            size={20}
            color={bgmEnabled ? '#312e81' : '#94a3b8'}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}
