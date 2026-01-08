import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = SCREEN_WIDTH * 1.5; 

export interface StreakShareCardRef {
  shareStreak: () => Promise<void>;
}

interface Props {
  streak: number;
}

export const StreakShareCard = forwardRef<StreakShareCardRef, Props>(({ streak }, ref) => {
  const viewShotRef = useRef<ViewShot>(null);

  useImperativeHandle(ref, () => ({
    shareStreak: async () => {
      try {
        console.log("Attempting to capture view...");
        await new Promise(resolve => setTimeout(resolve, 100));

        const uri = await captureRef(viewShotRef, {
          format: 'png',
          quality: 1.0,
          result: 'tmpfile',
        });

        await Sharing.shareAsync(uri);
      } catch (error) {
        console.error("Streak sharing failed:", error);
      }
    },
  }));

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
            <LinearGradient
                colors={['#0F172A', '#1E3A8A']} 
                style={styles.gradientBackground}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            >
                <Sparkle size={24} top={CARD_HEIGHT * 0.3} left={CARD_WIDTH * 0.2} opacity={0.8} />
                <Sparkle size={16} top={CARD_HEIGHT * 0.35} right={CARD_WIDTH * 0.25} opacity={0.6} />
                <Sparkle size={32} bottom={CARD_HEIGHT * 0.4} left={CARD_WIDTH * 0.15} opacity={0.9} />
                <Sparkle size={20} bottom={CARD_HEIGHT * 0.38} right={CARD_WIDTH * 0.2} opacity={0.7} />

                <View style={styles.contentContainer}>
                    <Text style={styles.bigNumber}>{streak}</Text>
                    
                    {/* --- FIXED: PLURALIZATION LOGIC --- */}
                    <Text style={styles.mainLabel}>
                        {streak === 1 ? 'day streak' : 'days streak'}
                    </Text>
                    
                    <Text style={styles.subLabel}>building momentum with Clarity</Text>
                </View>

                <View style={styles.brandingCapsule}>
                    <Feather name="feather" size={14} color="#E2E8F0" style={{ marginRight: 6 }} />
                    <Text style={styles.brandingText}>clarityapp.com</Text>
                </View>
            </LinearGradient>
        </ViewShot>
    </View>
  );
});

const Sparkle = ({ size, top, left, right, bottom, opacity }: any) => (
    <MaterialCommunityIcons 
        name="star-four-points" 
        size={size} 
        color="#38BDF8" 
        style={[styles.sparkle, { top, left, right, bottom, opacity }]} 
    />
);

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT + 1000, 
    left: 0,
    opacity: 0, 
    zIndex: -10,
  },
  gradientBackground: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60, 
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 120,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(56, 189, 248, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    includeFontPadding: false,
    lineHeight: 130,
  },
  mainLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: -10,
    textTransform: 'lowercase',
  },
  subLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8', 
    marginTop: 12,
  },
  sparkle: {
    position: 'absolute',
  },
  brandingCapsule: {
      position: 'absolute',
      bottom: 50,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)', 
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
  },
  brandingText: {
      color: '#E2E8F0',
      fontSize: 14,
      fontWeight: '600',
  }
});