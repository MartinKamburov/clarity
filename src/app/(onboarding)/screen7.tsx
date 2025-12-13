import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import Svg, { Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  FadeInUp // Import entrance animation
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const LOADING_MESSAGES = [
  "Analyzing your answers...",
  "Identifying your blocks...",
  "Curating your personalized journey...",
  "Finalizing your plan..."
];

const TOTAL_DURATION = 5000; // 5 seconds total for the cloud to fill
const MESSAGE_DURATION = TOTAL_DURATION / LOADING_MESSAGES.length;

// --- REUSABLE CLOUD SHAPE ---
// We use this path twice: once for the "empty" background, once for the "filling" foreground
const CLOUD_PATH = "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z";

export default function TheAnalysis() {
  const params = useLocalSearchParams(); 
  const { name } = params;

  const [messageIndex, setMessageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Animation Value: 0% -> 100%
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    // 1. Start the Cloud Filling Animation
    fillProgress.value = withTiming(100, { 
        duration: TOTAL_DURATION, 
        easing: Easing.linear 
    });

    // 2. Cycle Through Messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < LOADING_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, MESSAGE_DURATION);

    // 3. Finish Sequence
    const finishTimeout = setTimeout(() => {
      clearInterval(messageInterval);
      setIsFinished(true); // Shows the button
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, TOTAL_DURATION);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(finishTimeout);
    };
  }, []);

  const handleContinue = () => {
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     router.push({
        pathname: "/screen8", 
        params: params 
    });
  };

  // --- ANIMATED STYLES ---
  // This controls the height of the "mask" view
  const fillStyle = useAnimatedStyle(() => ({
    height: `${fillProgress.value}%`
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* --- THE FILLING CLOUD --- */}
        <View style={styles.cloudContainer}>
            {/* Layer 1: The "Empty" Background Cloud (Low Opacity) */}
            <Svg width={200} height={130} viewBox="0 0 24 24" style={styles.backCloud}>
                <Path d={CLOUD_PATH} fill="rgba(255, 255, 255, 0.3)" />
            </Svg>

            {/* Layer 2: The "Filling" Foreground Cloud */}
            <View style={styles.maskContainer}>
                {/* The Window that grows from 0 height to 100% height */}
                <Animated.View style={[styles.fillWindow, fillStyle]}>
                    {/* The Solid White Cloud inside the window */}
                    {/* Positioned absolute bottom so it doesn't squat/stretch */}
                    <Svg width={200} height={130} viewBox="0 0 24 24" style={styles.frontCloud}>
                        <Path d={CLOUD_PATH} fill="#FFFFFF" />
                    </Svg>
                </Animated.View>
            </View>
        </View>

        {/* --- TEXT SECTION --- */}
        <View style={styles.textContainer}>
          {isFinished ? (
            <Animated.View entering={FadeInUp.springify()}>
                <Text style={styles.successTitle}>It's a match!</Text>
                <Text style={styles.successText}>
                    This is the right app for you, {name}.
                </Text>
            </Animated.View>
          ) : (
            <Text style={styles.loadingText}>
                {LOADING_MESSAGES[messageIndex]}
            </Text>
          )}
        </View>

        {/* --- ACTION BUTTON (Only shows when finished) --- */}
        {isFinished && (
            <Animated.View 
                entering={FadeInUp.delay(300).springify()} 
                style={styles.footerContainer}
            >
                 <TouchableOpacity style={styles.button} onPress={handleContinue}>
                    <Text style={styles.buttonText}>Reveal My Plan</Text>
                    {/* Simple arrow icon */}
                    <Text style={styles.arrow}>→</Text>
                 </TouchableOpacity>
            </Animated.View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  
  // --- CLOUD VISUALS ---
  cloudContainer: {
    width: 200,
    height: 130,
    marginBottom: 50,
    justifyContent: 'flex-end', // Aligns filling from bottom
  },
  backCloud: {
    position: 'absolute',
    bottom: 0,
  },
  maskContainer: {
    width: 200,
    height: 130,
    position: 'absolute',
    bottom: 0,
    // This is the magic: We create a container that matches the cloud size
    // but the Animated View inside will handle the clipping
  },
  fillWindow: {
    width: '100%',
    overflow: 'hidden', // Clips the cloud inside
    position: 'absolute',
    bottom: 0, // Grows from the bottom up
  },
  frontCloud: {
    // This cloud sits inside the window but stays locked to the bottom
    position: 'absolute', 
    bottom: 0,
  },

  // --- TYPOGRAPHY ---
  textContainer: {
    height: 120, // Fixed height to prevent jumps
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#005A9C',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#005A9C',
    textAlign: 'center',
  },

  // --- BUTTON ---
  footerContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 50, // Floating at bottom
  },
  button: {
    backgroundColor: '#005A9C',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2, // Visual correction
  }
});