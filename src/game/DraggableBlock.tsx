import React, { useCallback } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedRef,
  measure,
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
  boardAnimatedRef: any;
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
  boardAnimatedRef,
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

  // Shared values to track latest touch position (updated instantly on UI thread)
  const latestAbsX = useSharedValue(0);
  const latestAbsY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Offset from finger touch point to block's visual center (captured at drag start)
  const fingerOffsetX = useSharedValue(0);
  const fingerOffsetY = useSharedValue(0);

  const blockRef = useAnimatedRef<Animated.View>();
  
  // Track measured properties at the start of drag
  const initialCenterX = useSharedValue(0);
  const initialCenterY = useSharedValue(0);
  const layoutX = useSharedValue(0);
  const layoutY = useSharedValue(0);

  const blockCellSize = CELL_SIZE * 0.8;
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;
  const contentW = shapeCols * blockCellSize + (shapeCols - 1) * CELL_GAP;
  const contentH = shapeRows * blockCellSize + (shapeRows - 1) * CELL_GAP;
  const shapeCenterInViewX = 8 + contentW / 2;
  const shapeCenterInViewY = 8 + contentH / 2;

  const ghostRow = useSharedValue(-20);
  const ghostCol = useSharedValue(-20);

  // Called on JS thread with the final computed row and col
  const handleDragMove = useCallback(
    (row: number, col: number) => {
      const shapeRows = shape.length;
      const shapeCols = shape[0].length;
      if (
        row >= -(shapeRows - 1) && col >= -(shapeCols - 1) &&
        row < BOARD_SIZE && col < BOARD_SIZE
      ) {
        onDragMove?.(row, col, shape, color);
      }
    },
    [onDragMove, shape, color]
  );

  // Use useAnimatedReaction to read the LATEST shared values each frame,
  // coalescing multiple gesture updates and computing grid pos on UI thread.
  // This prevents ghost lag when dragging fast.
  useAnimatedReaction(
    () => ({
      x: latestAbsX.value,
      y: latestAbsY.value,
      dragging: isDragging.value,
    }),
    (current, previous) => {
      if (
        current.dragging &&
        (current.x !== previous?.x || current.y !== previous?.y) &&
        layoutX.value !== 0
      ) {
        // UI Thread Grid Pos Calculation
        const currentBlockCenterX = initialCenterX.value + translateX.value;
        const currentBlockCenterY = initialCenterY.value + translateY.value; // translateY includes DRAG_LIFT_Y
        
        const relX = currentBlockCenterX - (layoutX.value + 4 + BOARD_PADDING);
        const relY = currentBlockCenterY - (layoutY.value + 4 + BOARD_PADDING);
        
        const shapeWidthPx = shapeCols * CELL_STEP - CELL_GAP;
        const shapeHeightPx = shapeRows * CELL_STEP - CELL_GAP;
        
        const topLeftX = relX - shapeWidthPx / 2;
        const topLeftY = relY - shapeHeightPx / 2;
        const col = Math.round(topLeftX / CELL_STEP);
        const row = Math.round(topLeftY / CELL_STEP);

        if (row !== ghostRow.value || col !== ghostCol.value) {
          ghostRow.value = row;
          ghostCol.value = col;
          runOnJS(handleDragMove)(row, col);
        }
      } else if (!current.dragging && previous?.dragging) {
        ghostRow.value = -20;
        ghostCol.value = -20;
      }
    },
    [handleDragMove, shape]
  );

  const handleDrop = useCallback(
    () => {
      // One final JS thread calc using final shared values if needed, 
      // but ghostRow/ghostCol already hold the correct cell!
      // However, to be safe, compute from raw gesture absolute:
      const finalAbsX = initialCenterX.value + translateX.value;
      const finalAbsY = initialCenterY.value + translateY.value;
      
      const relX = finalAbsX - (layoutX.value + 4 + BOARD_PADDING);
      const relY = finalAbsY - (layoutY.value + 4 + BOARD_PADDING);
      const shapeWidthPx = shapeCols * CELL_STEP - CELL_GAP;
      const col = Math.round((relX - shapeWidthPx / 2) / CELL_STEP);
      const shapeHeightPx = shapeRows * CELL_STEP - CELL_GAP;
      const row = Math.round((relY - shapeHeightPx / 2) / CELL_STEP);

      if (row >= 0 && col >= 0 && row < BOARD_SIZE && col < BOARD_SIZE) {
        onDrop(blockId, row, col);
      }
      onDragEnd?.();
    },
    [blockId, onDrop, onDragEnd, initialCenterX, initialCenterY, translateX, translateY, layoutX, layoutY, shapeCols, shapeRows]
  );

  const handleCancel = useCallback(() => {
    onDragEnd?.();
  }, [onDragEnd]);

  const handleStart = useCallback(() => {
    // Only clear old ghost state
    ghostRow.value = -20;
    ghostCol.value = -20;
    onDragStart?.();
  }, [ghostRow, ghostCol, onDragStart]);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      // Synchronous measure on UI thread! Free of any Safe Area or header offsets!
      const blockMeasurement = measure(blockRef);
      const boardMeasurement = measure(boardAnimatedRef);
      
      if (blockMeasurement && boardMeasurement) {
        layoutX.value = boardMeasurement.pageX;
        layoutY.value = boardMeasurement.pageY;
        
        initialCenterX.value = blockMeasurement.pageX + blockMeasurement.width / 2;
        initialCenterY.value = blockMeasurement.pageY + blockMeasurement.height / 2;
      }

      fingerOffsetX.value = event.x - shapeCenterInViewX;
      fingerOffsetY.value = event.y - shapeCenterInViewY;
      
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
      scale.value = withTiming(1.25, { duration: 150 });
      opacity.value = withTiming(0.75, { duration: 150 });
      runOnJS(handleStart)();
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY + DRAG_LIFT_Y;
      // Store latest position in shared values — picked up by useAnimatedReaction
      latestAbsX.value = event.absoluteX;
      latestAbsY.value = event.absoluteY;
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(handleDrop)();
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 150 });
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    })
    .onFinalize((_event, success) => {
      if (!success) {
        isDragging.value = false;
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

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View ref={blockRef} style={animatedStyle} className="items-center justify-center p-2">
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
