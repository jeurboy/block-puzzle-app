import React, { useCallback } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BOARD_SIZE, BOARD_PADDING, CELL_GAP, CELL_SIZE, CELL_STEP, Shape } from './constants';

// Lift block above finger so it's visible while dragging
const DRAG_LIFT_Y = -80;

type DraggableBlockProps = {
  shape: Shape;
  color: string;
  blockId: number;
  boardLayout: React.RefObject<{ x: number; y: number; width: number; height: number }>;
  onDrop: (blockId: number, row: number, col: number) => boolean;
  onDragMove?: (row: number, col: number, shape: Shape, color?: string) => void;
  onDragEnd?: () => void;
  onDragStart?: () => void;
};

export default function DraggableBlock({
  shape,
  color,
  blockId,
  boardLayout,
  onDrop,
  onDragMove,
  onDragEnd,
  onDragStart,
}: DraggableBlockProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const computeGridPos = useCallback(
    (absX: number, absY: number) => {
      const layout = boardLayout.current;
      if (!layout) return { row: -1, col: -1 };
      const shapeRows = shape.length;
      const shapeCols = shape[0].length;
      // Calculate the visual center of the dragged block
      // Finger is at absX/absY, block is lifted by DRAG_LIFT_Y
      const blockCenterX = absX;
      const blockCenterY = absY + DRAG_LIFT_Y;
      // Map block center to board-relative coords
      const relX = blockCenterX - layout.x - BOARD_PADDING;
      const relY = blockCenterY - layout.y - BOARD_PADDING;
      // Calculate the top-left cell of the shape based on its center
      const shapeWidthPx = shapeCols * CELL_STEP - CELL_GAP;
      const shapeHeightPx = shapeRows * CELL_STEP - CELL_GAP;
      const topLeftX = relX - shapeWidthPx / 2;
      const topLeftY = relY - shapeHeightPx / 2;
      // Snap top-left to nearest cell
      const col = Math.round(topLeftX / CELL_STEP);
      const row = Math.round(topLeftY / CELL_STEP);
      return { row, col };
    },
    [boardLayout, shape]
  );

  const handleDragMove = useCallback(
    (absX: number, absY: number) => {
      const { row, col } = computeGridPos(absX, absY);
      const shapeRows = shape.length;
      const shapeCols = shape[0].length;
      // Allow ghost as long as shape overlaps the board at all
      if (
        row >= -(shapeRows - 1) && col >= -(shapeCols - 1) &&
        row < BOARD_SIZE && col < BOARD_SIZE
      ) {
        onDragMove?.(row, col, shape, color);
      }
    },
    [computeGridPos, onDragMove, shape, color]
  );

  const handleDrop = useCallback(
    (absX: number, absY: number) => {
      const { row, col } = computeGridPos(absX, absY);
      if (row >= 0 && col >= 0 && row < BOARD_SIZE && col < BOARD_SIZE) {
        onDrop(blockId, row, col);
      }
      onDragEnd?.();
    },
    [computeGridPos, blockId, onDrop, onDragEnd]
  );

  const handleCancel = useCallback(() => {
    onDragEnd?.();
  }, [onDragEnd]);

  const handleStart = useCallback(() => {
    onDragStart?.();
  }, [onDragStart]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      scale.value = withTiming(1.15, { duration: 150 });
      opacity.value = withTiming(0.75, { duration: 150 });
      runOnJS(handleStart)();
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY + DRAG_LIFT_Y;
      runOnJS(handleDragMove)(event.absoluteX, event.absoluteY);
    })
    .onEnd((event) => {
      runOnJS(handleDrop)(event.absoluteX, event.absoluteY);
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 150 });
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    })
    .onFinalize((_event, success) => {
      if (!success) {
        runOnJS(handleCancel)();
        scale.value = withSpring(1);
        opacity.value = withTiming(1, { duration: 150 });
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const blockCellSize = CELL_SIZE * 0.8;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle} className="items-center justify-center p-2">
        {shape.map((row, rowIndex) => (
          <View
            key={rowIndex}
            className="flex-row"
            style={{ gap: CELL_GAP, marginTop: rowIndex > 0 ? CELL_GAP : 0 }}
          >
            {row.map((cell, colIndex) => (
              <View
                key={colIndex}
                style={{
                  width: blockCellSize,
                  height: blockCellSize,
                  borderRadius: 6,
                  overflow: 'hidden',
                  opacity: cell === 1 ? 1 : 0,
                }}
              >
                {cell === 1 && (
                  <>
                    <View
                      className={color}
                      style={{
                        width: blockCellSize,
                        height: blockCellSize,
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
                        height: blockCellSize * 0.4,
                        backgroundColor: 'rgba(255,255,255,0.35)',
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5,
                        borderBottomLeftRadius: blockCellSize * 0.6,
                        borderBottomRightRadius: blockCellSize * 0.6,
                      }}
                    />
                    {/* Inner glow dot */}
                    <View
                      style={{
                        position: 'absolute',
                        top: blockCellSize * 0.15,
                        left: blockCellSize * 0.2,
                        width: blockCellSize * 0.2,
                        height: blockCellSize * 0.15,
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderRadius: blockCellSize * 0.1,
                      }}
                    />
                    {/* Bottom shadow */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: blockCellSize * 0.3,
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
                  </>
                )}
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </GestureDetector>
  );
}
