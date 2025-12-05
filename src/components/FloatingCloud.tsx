import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import Cloud from './Cloud';

export default function FloatingCloud() {
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  useEffect(() => {
    // Move up and down infinitely
    offset.value = withRepeat(
      withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite
      true // Reverse direction
    );
  }, []);

  return (
    <Animated.View style={animatedStyles}>
      <Cloud width={120} height={80} />
    </Animated.View>
  );
}