import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Image, 
  Dimensions
} from "react-native";
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ScienceFact() {

  // --- 1. Animation Logic (Restored) ---
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(15, { // Float up by 15px
        duration: 2500,
        easing: Easing.inOut(Easing.quad),
      }),
      -1, // Infinite
      true // Reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // --- 2. Navigation ---
  const handleNextPage = () => {
    // Go to the name input screen
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/screen2"); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        
        {/* TOP: Floating Icon */}
        <Animated.View 
          style={[
            animatedStyle, 
            { alignItems: 'center', width: '100%', marginTop: 20 } 
          ]}
        >
          <Image 
            source={require('../../../assets/ClarityIcon.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* MIDDLE: The "Knowledge Cloud" Card */}
        <View style={styles.cardContainer}>
          <Text style={styles.headerText}>
             Did you know? 🧠
          </Text>
          <Text style={styles.bodyText}>
             Multiple studies show that practicing daily affirmations can <Text style={styles.highlight}>rewire your brain</Text>.
          </Text>
          <Text style={styles.bodyText}>
             They are proven to reduce stress, increase resilience, and boost your overall well-being.
          </Text>
        </View>

        {/* BOTTOM: Action Button */}
        <View style={styles.footerContainer}>
            <Pressable 
            onPress={handleNextPage} 
            style={({ pressed }) => [
                styles.buttonStyling,
                pressed && styles.buttonPressed
            ]}
            >
            <Text style={styles.buttonText}>Tell me more</Text>
            </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB", // Clarity Sky Blue
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between', // Spreads Icon, Card, and Button apart
    paddingHorizontal: 24,
    paddingBottom: 40, // Space for bottom button
  },
  heroImage: {
    width: width * 0.5, // Slightly smaller than landing page for balance
    height: width * 0.5,
    maxHeight: 250,
  },

  // -- The Knowledge Card --
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Almost solid white
    borderRadius: 30,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#005A9C', 
    marginBottom: 16,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 17,
    color: '#4A5568', // Slate Gray for readability
    textAlign: 'center',
    lineHeight: 26, // Makes it easier to read
    marginBottom: 12,
  },
  highlight: {
    color: '#005A9C',
    fontWeight: '700',
  },

  // -- Button Styles --
  footerContainer: {
    width: '100%',
    marginBottom: 10,
  },
  buttonStyling: {
    width: '100%',
    backgroundColor: '#005A9C', 
    paddingVertical: 18,
    borderRadius: 30, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    backgroundColor: '#004080', 
    transform: [{ scale: 0.98 }], 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  }, 
});