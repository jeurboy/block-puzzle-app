import React, { useEffect } from 'react';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';

export default function Mascot() {
  const lastAction = useGameStore((s) => s.lastAction);
  const linesClearedThisTurn = useGameStore((s) => s.linesClearedThisTurn);

  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue('0deg');

  useEffect(() => {
    if (lastAction === 'clear' && linesClearedThisTurn > 1) {
      // Perform a happy jump animation for combo clear
      // Jump up
      translateY.value = withSequence(
        withTiming(-50, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 150, easing: Easing.in(Easing.bounce) }),
        withTiming(-30, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 120, easing: Easing.in(Easing.bounce) })
      );
      
      // Little scale bounce
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(0.9, { duration: 150 }),
        withTiming(1.1, { duration: 120 }),
        withTiming(1, { duration: 120 })
      );

      // A tiny wiggle
      rotation.value = withSequence(
        withTiming('-15deg', { duration: 100 }),
        withTiming('15deg', { duration: 100 }),
        withTiming('-10deg', { duration: 100 }),
        withTiming('10deg', { duration: 100 }),
        withTiming('0deg', { duration: 100 })
      );
    } else if (lastAction === 'clear' && linesClearedThisTurn === 1) {
      // Just a small hop for single line
      translateY.value = withSequence(
        withTiming(-20, { duration: 100 }),
        withTiming(0, { duration: 150, easing: Easing.bounce })
      );
    } else if (lastAction === 'gameover') {
      // Squish down when game over
      scale.value = withSpring(0.8);
      translateY.value = withSpring(20);
    } else {
      // Reset slowly if needed
      scale.value = withTiming(1);
      translateY.value = withTiming(0);
      rotation.value = withTiming('0deg');
    }
  }, [lastAction, linesClearedThisTurn, translateY, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: rotation.value },
    ],
  }));

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }, animatedStyle]}>
      <Image
        source={require('../../assets/images/mascot.png')}
        style={{ width: 100, height: 100 }}
        contentFit="contain"
      />
    </Animated.View>
  );
}
