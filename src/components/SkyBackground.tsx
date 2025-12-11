import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing, 
  withDelay 
} from 'react-native-reanimated';
import { Cloud } from './Cloud';

// --- Internal Component: A Single Drifting Cloud ---
const DriftingCloud = ({ delay, duration, yPosition, scale, opacity }: any) => {
  const { width: screenWidth } = useWindowDimensions();
  const cloudWidth = 100 * scale;

  const translateX = useSharedValue(-cloudWidth);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: yPosition,
    opacity: opacity,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale }
    ],
  }));

  useEffect(() => {
    // Horizontal Drift
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(screenWidth + cloudWidth, { duration: duration, easing: Easing.linear }),
        -1, // Infinite
        false
      )
    );

    // Vertical Bobbing
    translateY.value = withRepeat(
      withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  return (
    <Animated.View style={animatedStyle}>
      <Cloud width={100} height={60} />
    </Animated.View>
  );
};

// --- Main Component: The Sky Background ---
export default function SkyBackground() {
  return (
    <View style={styles.sky}>
      {/* Background Layer (Slower, Smaller) */}
      <DriftingCloud yPosition={40} duration={25000} scale={0.5} opacity={0.4} delay={0} />
      <DriftingCloud yPosition={120} duration={30000} scale={0.6} opacity={0.5} delay={10000} />

      {/* Foreground Layer (Faster, Larger) */}
      <DriftingCloud yPosition={80} duration={15000} scale={1.2} opacity={0.9} delay={2000} />
      <DriftingCloud yPosition={300} duration={18000} scale={1} opacity={0.8} delay={500} />
    </View>
  );
}

const styles = StyleSheet.create({
  sky: {
    flex: 1,
    backgroundColor: '#87CEEB', // Nice Sky Blue
    overflow: 'hidden',
  },
});