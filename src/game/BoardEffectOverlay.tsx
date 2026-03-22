import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';

export default function BoardEffectOverlay() {
  const boardEffect = useGameStore((s) => s.boardEffect);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (boardEffect) {
      opacity.value = withSequence(
        withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
        withDelay(250, withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }))
      );
      scale.value = withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(2)) }),
        withDelay(150, withTiming(0.8, { duration: 200, easing: Easing.in(Easing.quad) }))
      );
    }
  }, [boardEffect, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!boardEffect) return null;

  const icon = boardEffect === 'mirror' ? '🪞' : '🔄';
  const label = boardEffect === 'mirror' ? 'MIRROR!' : 'ROTATE!';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: 64 }}>{icon}</Text>
      <Text
        style={{
          color: '#ffffff',
          fontSize: 28,
          fontFamily: 'Fredoka-Medium',
          fontWeight: '900',
          letterSpacing: 3,
          marginTop: 4,
          textShadowColor: 'rgba(0,0,0,0.5)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 8,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
