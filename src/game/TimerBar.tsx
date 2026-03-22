import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

type TimerBarProps = {
  deadline: number;
};

export default function TimerBar({ deadline }: TimerBarProps) {
  const progress = useSharedValue(1);

  useEffect(() => {
    const remaining = deadline - Date.now();
    const duration = Math.max(remaining, 0);
    // Start from current remaining fraction
    progress.value = duration / 5000;
    progress.value = withTiming(0, {
      duration,
      easing: Easing.linear,
    });
  }, [deadline, progress]);

  const barStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      progress.value,
      [0, 0.3, 1],
      ['#ef4444', '#f59e0b', '#22c55e']
    );
    return {
      width: `${progress.value * 100}%` as any,
      backgroundColor: bgColor,
    };
  });

  return (
    <View
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: 6,
            borderRadius: 3,
          },
          barStyle,
        ]}
      />
    </View>
  );
}
