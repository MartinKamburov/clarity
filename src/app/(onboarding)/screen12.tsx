import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- THEME MAPPING ---
const THEME_STYLES: Record<string, { bg: string, text: string, icon: string }> = {
  clarity:  { bg: '#87CEEB', text: '#FFFFFF', icon: '#FFFFFF' },
  midnight: { bg: '#1A202C', text: '#E2E8F0', icon: '#E2E8F0' },
  paper:    { bg: '#FFFFFF', text: '#2D3748', icon: '#2D3748' },
  lavender: { bg: '#E9D8FD', text: '#553C9A', icon: '#553C9A' },
};

export default function TheWidget() {
  const params = useLocalSearchParams();
  const { theme } = params;
  
  const currentTheme = THEME_STYLES[theme as string] || THEME_STYLES['clarity'];

  const handleNext = (showTutorial: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    router.push({
      pathname: "/screen13", 
      params: { 
        ...params,
        wantsWidgetTutorial: showTutorial ? 'true' : 'false'
      }
    });
  };

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            
            {/* --- HEADER (Compact) --- */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Keep Clarity on your home screen</Text>
                <Text style={styles.headerSubtitle}>
                    A gentle reminder every time you unlock.
                </Text>
            </View>

            {/* --- MOCK PHONE PREVIEW (Scaled Down) --- */}
            <Animated.View 
                entering={FadeInUp.springify().delay(200)}
                style={styles.mockPhone}
            >
                {/* Status Bar / Notch */}
                <View style={styles.notchContainer}>
                    <View style={styles.notch} />
                </View>

                {/* THE WIDGET */}
                <View style={[styles.widgetCard, { backgroundColor: currentTheme.bg }]}>
                    <View style={styles.widgetHeader}>
                        <Image 
                            source={require('../../../assets/ClarityIcon.png')} 
                            style={{ width: 14, height: 14, tintColor: currentTheme.icon }}
                            resizeMode="contain"
                        />
                        <Text style={[styles.widgetAppName, { color: currentTheme.text }]}>
                            Clarity
                        </Text>
                    </View>
                    
                    <Text style={[styles.widgetQuote, { color: currentTheme.text }]}>
                        I am exactly where I need to be.
                    </Text>
                </View>

                {/* DUMMY APP ICONS */}
                <View style={styles.appGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <View key={i} style={styles.dummyApp}>
                            <View style={styles.appIconSquare} />
                            <View style={styles.appLabelLine} />
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* --- FOOTER ACTIONS --- */}
            <View style={styles.footer}>
                {/* Primary Action */}
                <TouchableOpacity 
                    style={styles.mainButton} 
                    onPress={() => handleNext(true)}
                >
                    <Text style={styles.mainButtonText}>Show me how</Text>
                    <Feather name="arrow-right" size={18} color="#005A9C" />
                </TouchableOpacity>

                {/* Secondary Action */}
                <TouchableOpacity 
                    style={styles.secondaryButton} 
                    onPress={() => handleNext(false)}
                >
                    <Text style={styles.secondaryButtonText}>I'll add it later</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 10, // Reduced vertical padding
    paddingBottom: 30,
  },
  
  // --- HEADER ---
  headerContainer: {
    marginBottom: 20, // Reduced from 30
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24, // Reduced from 26
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#E0F7FA',
    textAlign: 'center',
  },

  // --- MOCK PHONE ---
  mockPhone: {
    // SCALED DOWN: Width 65% instead of 75%
    width: width * 0.65, 
    // SCALED DOWN: Height aspect ratio 1.5 instead of 1.6
    height: (width * 0.65) * 1.5, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderRadius: 24,
    borderWidth: 4, // Thinner bezel
    borderColor: '#FFFFFF',
    padding: 16, // Less internal padding
    alignItems: 'center',
    shadowColor: "#003366",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 25, // Reduced space below phone
  },
  notchContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15, // Reduced margin
  },
  notch: {
    width: 40, // Smaller notch
    height: 8,
    backgroundColor: '#CBD5E0',
    borderRadius: 4,
  },

  // --- WIDGET ---
  widgetCard: {
    width: '100%',
    aspectRatio: 2.2 / 1, // Slightly flatter widget to save space
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
    marginBottom: 20, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  widgetAppName: {
    fontSize: 9, // Smaller text
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  widgetQuote: {
    fontSize: 11, // Smaller quote text
    fontWeight: '700',
    lineHeight: 15,
  },

  // --- DUMMY APPS ---
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10, 
  },
  dummyApp: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  appIconSquare: {
    width: 34, // Smaller icons (was 40)
    height: 34,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  appLabelLine: {
    width: 20,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },

  // --- FOOTER ---
  footer: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 12, // Tighter gap between buttons
    alignItems: 'center',
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16, // Slightly shorter button
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  mainButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#005A9C',
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
});