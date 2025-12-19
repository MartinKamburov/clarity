import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import SkyBackground from '../components/SkyBackground'; // Adjust path as needed
import { AeroButton } from '../components/AeroButton';   // Adjust path as needed
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function FirstPage() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); //Used to vibrate the page

    translateY.value = withRepeat(
      withTiming(15, { // Move UP by 15 pixels
        duration: 2500, // Takes 2.5 seconds (slow and floaty)
        easing: Easing.inOut(Easing.quad), // Smooth start/stop
      }),
      -1, // Infinite repeat
      true // Reverse (go back down)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/screen1');
    // router.push('/home'); //use this for testing purposes right now change later
  }

  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 1. The Moving Cloud Background */}
      <View style={StyleSheet.absoluteFill}>
        <SkyBackground />
      </View>

      <SafeAreaView style={styles.safeContainer}>
        
        {/* TOP SECTION: Logo & Image */}
        <Animated.View 
          style={[
            animatedStyle, 
            { alignItems: 'center', width: '100%' } // <--- THIS FIXES THE CENTERING
          ]}
        >
          <Image 
            source={require('../../assets/ClarityIcon.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* MIDDLE SECTION: Text & Social Proof */}
        <View style={styles.textSection}>
          {/* Social Proof Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✨ +1000 lives changed</Text>
          </View>

          <Text style={styles.headline}>
            Transform your life with daily affirmations
          </Text>

          <Text style={styles.subHeadline}>
            Sometimes all we need is a gentle reminder
          </Text>
        </View>

        {/* BOTTOM SECTION: CTA Button */}
        <View style={styles.footerSection}>
          <AeroButton 
            title="Get Started"
            onPress={handleGetStarted}
            style={{ width: '100%' }}
          />
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB", // Fallback color if clouds don't load
  },
  safeContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between', // Pushes content to top/bottom
    paddingBottom: 20,
  },
  
  // --- IMAGERY ---
  headerSection: {
    flex: 1, // Takes up the top space
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  heroImage: {
    width: width * 0.8, // 80% of screen width
    height: width * 0.8,
    maxHeight: 350,
  },

  // --- TYPOGRAPHY ---
  textSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Start from top of this section
    gap: 16, // Space between elements
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Glass effect
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  badgeText: {
    color: '#005A9C',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800', // Extra bold
    color: '#1A365D', // Very dark blue for readability
    textAlign: 'center',
    lineHeight: 40,
  },
  subHeadline: {
    fontSize: 18,
    color: '#4A5568', // Slate gray
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },

  // --- FOOTER ---
  footerSection: {
    marginBottom: 80,
    gap: 16,
    alignItems: 'center',
  }
});