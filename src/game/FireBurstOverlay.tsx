import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { BOARD_PADDING, CELL_GAP, CELL_SIZE } from './constants';

type FireBurstOverlayProps = {
  clearingCells: Set<string>;
};

/** Single cell explosion — just 1 Animated.View with glow burst */
function CellBurst({ row, col, delay }: { row: number; col: number; delay: number }) {
  const size = CELL_SIZE * 2;
  const cx = BOARD_PADDING + col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 - size / 2;
  const cy = BOARD_PADDING + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 - size / 2;

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  // Start immediately on mount — no useEffect
  opacity.value = withDelay(delay, withSequence(
    withTiming(1, { duration: 50 }),
    withTiming(0.8, { duration: 200 }),
    withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
  ));
  scale.value = withDelay(delay, withSequence(
    withTiming(1.3, { duration: 80, easing: Easing.out(Easing.back(2)) }),
    withTiming(1.8, { duration: 400, easing: Easing.out(Easing.quad) })
  ));

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: cx,
          top: cy,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FF8C00',
          shadowColor: '#FF5722',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
          elevation: 6,
        },
        style,
      ]}
    />
  );
}

export default function FireBurstOverlay({ clearingCells }: FireBurstOverlayProps) {
  const cells = useMemo(() => {
    if (clearingCells.size === 0) return [];
    return Array.from(clearingCells).map((key, i) => {
      const [r, c] = key.split(',').map(Number);
      return { key, row: r, col: c, delay: i * 5 };
    });
  }, [clearingCells]);

  if (cells.length === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {cells.map((c) => (
        <CellBurst key={c.key} row={c.row} col={c.col} delay={c.delay} />
      ))}
    </View>
  );
}
