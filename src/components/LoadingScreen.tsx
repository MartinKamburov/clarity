import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  FadeIn
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
  // Shared values for animation
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    // Setup the "Breathing" animation loop
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite loop
      true // Reverse: false (handled by sequence)
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {/* Optional: Background circle for depth */}
      <View style={styles.backgroundCircle} />

      {/* Breathing Logo */}
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image 
            // Make sure this path matches where your image is stored
            source={require('../../assets/ClarityIcon.png')} 
            style={styles.logo}
            resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.text}>Preparing your content...</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // This makes it cover the whole screen over your existing content
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F9FF', // Very light blue/white to match theme
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Ensure it sits on top
  },
  backgroundCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#E0F2FE', // Slightly darker circle behind
    opacity: 0.5,
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: '#005A9C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#005A9C', // Your app's primary dark blue
    letterSpacing: 0.5,
    opacity: 0.8,
  },
});