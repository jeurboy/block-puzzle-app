import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  withRepeat,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useGameStore } from '../store/gameStore';
import LottieView from 'lottie-react-native';

export default function LevelUpOverlay() {
  const currentLevel = useGameStore((s) => s.level);
  const [showLevel, setShowLevel] = useState(0);
  const previousLevel = useRef(currentLevel);

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const rotation = useSharedValue('0deg');
  
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (currentLevel > previousLevel.current) {
      // Level Up!
      setShowLevel(currentLevel);
      
      // Play particle effect if available
      lottieRef.current?.play();

      // Animate In
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1.2, { damping: 10, stiffness: 100 }, () => {
        scale.value = withSpring(1);
      });
      translateY.value = withSpring(0, { damping: 10, stiffness: 100 });

      // Squirrel shake / cheer
      rotation.value = withSequence(
        withTiming('-15deg', { duration: 100 }),
        withRepeat(withTiming('15deg', { duration: 200 }), 3, true),
        withTiming('0deg', { duration: 100 })
      );

      // Dismiss after 2.5 seconds
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          scale.value = 0;
          translateY.value = 50;
          runOnJS(setShowLevel)(0);
        });
      }, 2500);
    }
    
    // For resetting if game restarts
    if (currentLevel < previousLevel.current) {
        setShowLevel(0);
    }
    
    previousLevel.current = currentLevel;
  }, [currentLevel, opacity, scale, translateY, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotateZ: rotation.value }
    ],
  }));

  if (!showLevel) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} className="z-50 items-center justify-center pointer-events-none">
      <View className="absolute inset-0 bg-black/40" />
      
      <LottieView
        ref={lottieRef}
        source={require('../../assets/lottie/confetti.json')}
        style={StyleSheet.absoluteFillObject}
        autoPlay={false}
        loop={false}
      />

      <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
        <View className="relative items-center justify-center">
          {/* Glowing Backlight */}
          <View className="absolute w-64 h-64 bg-amber-400/40 rounded-full blur-3xl opacity-70" />
          
          <Image
            source={require('../../assets/images/mascot.png')}
            style={{ width: 180, height: 180, bottom: -10 }}
            contentFit="contain"
          />
        </View>

        <View className="bg-white px-8 py-3 rounded-full border-4 border-amber-400 shadow-xl items-center mt-2">
          <Text className="text-amber-500 text-3xl font-fredoka uppercase tracking-wider text-center shadow-sm">
            Level Up!
          </Text>
          <Text className="text-pink-500 text-xl font-fredoka mt-1">
            Reached Level {showLevel}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
