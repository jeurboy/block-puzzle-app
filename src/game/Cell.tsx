import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { CELL_SIZE } from './constants';

// Map NativeWind bg classes to hex for inline styles (used by ghost preview)
const COLOR_MAP: Record<string, string> = {
  'bg-emerald-500': '#10b981',
  'bg-indigo-500': '#6366f1',
  'bg-rose-500': '#f43f5e',
  'bg-amber-500': '#f59e0b',
  'bg-cyan-500': '#06b6d4',
  'bg-purple-500': '#a855f7',
  'bg-pink-500': '#ec4899',
  'bg-teal-500': '#14b8a6',
};

type CellProps = {
  colorClass: string;
  isClearing?: boolean;
  isGhost?: boolean;
};

function Cell({ colorClass, isClearing, isGhost }: CellProps) {
  const scale = useSharedValue(1);
  const cellOpacity = useSharedValue(1);

  useEffect(() => {
    if (isClearing) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
      );
      cellOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 250 })
      );
    } else {
      scale.value = 1;
      cellOpacity.value = 1;
    }
  }, [isClearing, scale, cellOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: cellOpacity.value,
  }));

  const isEmpty = colorClass === 'bg-indigo-900/10';
  const isInvalidGhost = colorClass === 'bg-red-400/40';

  // Valid ghost — translucent 3D jewel block preview
  if (isGhost && !isInvalidGhost) {
    const ghostHex = COLOR_MAP[colorClass] ?? '#6366f1';
    return (
      <View
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          borderRadius: 6,
          overflow: 'hidden',
          opacity: 0.5,
        }}
      >
        {/* Base color */}
        <View
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            borderRadius: 6,
            backgroundColor: ghostHex,
          }}
        />
        {/* Top glossy shine */}
        <View
          style={{
            position: 'absolute',
            top: 1,
            left: 2,
            right: 2,
            height: CELL_SIZE * 0.4,
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            borderBottomLeftRadius: CELL_SIZE * 0.6,
            borderBottomRightRadius: CELL_SIZE * 0.6,
          }}
        />
        {/* Inner glow dot */}
        <View
          style={{
            position: 'absolute',
            top: CELL_SIZE * 0.15,
            left: CELL_SIZE * 0.2,
            width: CELL_SIZE * 0.2,
            height: CELL_SIZE * 0.15,
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: CELL_SIZE * 0.1,
          }}
        />
        {/* Bottom shadow */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: CELL_SIZE * 0.3,
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
          }}
        />
      </View>
    );
  }

  // Invalid ghost — red tint
  if (isGhost && isInvalidGhost) {
    return (
      <View
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          borderRadius: 6,
          backgroundColor: 'rgba(239,68,68,0.3)',
        }}
      />
    );
  }

  // Glossy jewel effect for filled cells
  if (!isEmpty) {
    return (
      <Animated.View style={animatedStyle}>
        <View
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {/* Base color */}
          <View
            className={colorClass}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              borderRadius: 6,
            }}
          />
          {/* Top glossy shine */}
          <View
            style={{
              position: 'absolute',
              top: 1,
              left: 2,
              right: 2,
              height: CELL_SIZE * 0.4,
              backgroundColor: 'rgba(255,255,255,0.35)',
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              borderBottomLeftRadius: CELL_SIZE * 0.6,
              borderBottomRightRadius: CELL_SIZE * 0.6,
            }}
          />
          {/* Inner glow dot */}
          <View
            style={{
              position: 'absolute',
              top: CELL_SIZE * 0.15,
              left: CELL_SIZE * 0.2,
              width: CELL_SIZE * 0.2,
              height: CELL_SIZE * 0.15,
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: CELL_SIZE * 0.1,
            }}
          />
          {/* Bottom shadow */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: CELL_SIZE * 0.3,
              backgroundColor: 'rgba(0,0,0,0.25)',
              borderBottomLeftRadius: 6,
              borderBottomRightRadius: 6,
            }}
          />
          {/* Left highlight edge */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
            }}
          />
          {/* Right shadow edge */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: 2,
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
            }}
          />
        </View>
      </Animated.View>
    );
  }

  // Empty cells
  return (
    <View
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 4,
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 0.5,
        borderColor: 'rgba(99,102,241,0.15)',
      }}
    />
  );
}

export default React.memo(Cell);
