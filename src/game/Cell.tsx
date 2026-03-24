import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { CELL_SIZE } from './constants';

type CellProps = {
  colorClass: string;
  isClearing?: boolean;
  isGhost?: boolean;
  isSabotage?: boolean;
  durability?: number;
};

function Cell({ colorClass, isClearing, isGhost, isSabotage, durability }: CellProps) {
  const scale = useSharedValue(1);
  const cellOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isClearing) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 120, easing: Easing.out(Easing.back(2)) }),
        withTiming(1.6, { duration: 300, easing: Easing.out(Easing.quad) })
      );
      cellOpacity.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
      );
    } else if (isSabotage) {
      // Pop-in animation for sabotage blocks
      scale.value = 0;
      cellOpacity.value = 0;
      scale.value = withSequence(
        withTiming(1.4, { duration: 200, easing: Easing.out(Easing.back(3)) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.quad) })
      );
      cellOpacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = 1;
      cellOpacity.value = 1;
    }
  }, [isClearing, isSabotage, scale, cellOpacity]);

  // Subtle pulse for durability 2 blocks
  useEffect(() => {
    if (durability === 2) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [durability, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
    opacity: cellOpacity.value,
  }));

  const isEmpty = colorClass === 'bg-indigo-900/10';
  const isInvalidGhost = colorClass === 'bg-red-400/40';

  // Render special sabotage block (durability-based)
  const renderSpecialBlock = () => {
    const isDurable = durability === 2;
    return (
      <View
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {/* Base — dark stone color */}
        <View
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            borderRadius: 6,
            backgroundColor: isDurable ? '#374151' : '#6b7280',
          }}
        />
        {/* Metallic shine */}
        <View
          style={{
            position: 'absolute',
            top: 1,
            left: 2,
            right: 2,
            height: CELL_SIZE * 0.35,
            backgroundColor: isDurable
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(255,255,255,0.25)',
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            borderBottomLeftRadius: CELL_SIZE * 0.6,
            borderBottomRightRadius: CELL_SIZE * 0.6,
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
            backgroundColor: 'rgba(0,0,0,0.35)',
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
          }}
        />
        {/* Crack lines for durability 1 */}
        {!isDurable && (
          <>
            <View
              style={{
                position: 'absolute',
                top: CELL_SIZE * 0.2,
                left: CELL_SIZE * 0.15,
                width: CELL_SIZE * 0.5,
                height: 1.5,
                backgroundColor: 'rgba(0,0,0,0.4)',
                transform: [{ rotate: '25deg' }],
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: CELL_SIZE * 0.45,
                left: CELL_SIZE * 0.3,
                width: CELL_SIZE * 0.35,
                height: 1.5,
                backgroundColor: 'rgba(0,0,0,0.3)',
                transform: [{ rotate: '-15deg' }],
              }}
            />
          </>
        )}
        {/* Shield icon for durability 2 */}
        {isDurable && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: CELL_SIZE * 0.45,
                color: 'rgba(255,255,255,0.7)',
                fontWeight: '900',
              }}
            >
              2
            </Text>
          </View>
        )}
        {/* Border glow for durability 2 */}
        {isDurable && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 6,
              borderWidth: 1.5,
              borderColor: 'rgba(251,191,36,0.5)',
            }}
          />
        )}
      </View>
    );
  };

  // Helper to render the shiny 3D jewel block
  const renderJewel = (opacityVal: number = 1) => (
    <View style={{ opacity: opacityVal }}>
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
    </View>
  );

  // Valid ghost — translucent 3D jewel block preview
  if (isGhost && !isInvalidGhost) {
    return renderJewel(0.6);
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

  // Special block with durability
  if (durability !== undefined) {
    return (
      <Animated.View style={animatedStyle}>
        {renderSpecialBlock()}
      </Animated.View>
    );
  }

  // Glossy jewel effect for filled cells
  if (!isEmpty) {
    return (
      <Animated.View style={animatedStyle}>
        {renderJewel(1)}
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
