import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { BOARD_PADDING, CELL_GAP, CELL_SIZE } from './constants';

const SQUIRREL_SIZE = CELL_SIZE * 2;
const MAX_SQUIRRELS = 5;

type SquirrelBreakOverlayProps = {
  clearingCells: Set<string>;
};

/** Pick up to MAX_SQUIRRELS random cells so we don't spam animations. */
function pickCells(cells: Set<string>): { row: number; col: number }[] {
  const arr = Array.from(cells).map((key) => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });
  // Shuffle and take a subset
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, MAX_SQUIRRELS);
}

function SquirrelSprite({ row, col, index }: { row: number; col: number; index: number }) {
  const lottieRef = useRef<LottieView>(null);
  const opacity = useSharedValue(0);

  const left = BOARD_PADDING + col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 - SQUIRREL_SIZE / 2;
  const top = BOARD_PADDING + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 - SQUIRREL_SIZE / 2;

  useEffect(() => {
    const delay = index * 40; // stagger each squirrel slightly
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })
      )
    );
    const timer = setTimeout(() => {
      lottieRef.current?.reset();
      lottieRef.current?.play();
    }, delay);
    return () => clearTimeout(timer);
  }, [index, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left,
          top,
          width: SQUIRREL_SIZE,
          height: SQUIRREL_SIZE,
        },
        animatedStyle,
      ]}
    >
      <LottieView
        ref={lottieRef}
        source={require('../../assets/lottie/squirrel-break.json')}
        autoPlay={false}
        loop={false}
        speed={1.2}
        style={{ width: SQUIRREL_SIZE, height: SQUIRREL_SIZE }}
      />
    </Animated.View>
  );
}

export default function SquirrelBreakOverlay({ clearingCells }: SquirrelBreakOverlayProps) {
  const positions = useMemo(() => {
    if (clearingCells.size === 0) return [];
    return pickCells(clearingCells);
  }, [clearingCells]);

  if (positions.length === 0) return null;

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {positions.map((pos, i) => (
        <SquirrelSprite
          key={`${pos.row}-${pos.col}`}
          row={pos.row}
          col={pos.col}
          index={i}
        />
      ))}
    </Animated.View>
  );
}
