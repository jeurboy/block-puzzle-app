import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

type ParticleOverlayProps = {
  visible: boolean;
  onFinish?: () => void;
};

export default function ParticleOverlay({ visible, onFinish }: ParticleOverlayProps) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      lottieRef.current?.reset();
      lottieRef.current?.play();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LottieView
        ref={lottieRef}
        source={require('../../assets/lottie/confetti.json')}
        autoPlay={false}
        loop={false}
        speed={1.5}
        onAnimationFinish={onFinish}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
