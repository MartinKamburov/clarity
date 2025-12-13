import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons'; // Standard icon set in Expo

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding
const CARD_HEIGHT = CARD_WIDTH * 1.6; // Tall aspect ratio like a phone

// --- THEME DATA ---
const THEMES = [
  {
    id: 'clarity',
    name: 'Clarity',
    bg: '#87CEEB', // Sky Blue
    text: '#FFFFFF',
    icon: '#FFFFFF',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    bg: '#1A202C', // Dark Navy/Black
    text: '#E2E8F0',
    icon: '#E2E8F0',
  },
  {
    id: 'paper',
    name: 'Minimal',
    bg: '#F7FAFC', // Off-White
    text: '#2D3748', // Dark Gray
    icon: '#2D3748',
  },
  {
    id: 'lavender',
    name: 'Spirit',
    bg: '#E9D8FD', // Soft Purple
    text: '#553C9A', // Dark Purple
    icon: '#553C9A',
  },
];

export default function TheAesthetic() {
  const params = useLocalSearchParams();
  const [selectedTheme, setSelectedTheme] = useState('clarity');

  const handleSelect = (id: string) => {
    Haptics.selectionAsync();
    setSelectedTheme(id);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/screen12", // The Widget Tease
      params: { 
        ...params, 
        theme: selectedTheme 
      }
    });
  };

  // --- RENDER A MINI PHONE CARD ---
  const renderThemeCard = (theme: typeof THEMES[0]) => {
    const isSelected = selectedTheme === theme.id;

    return (
      <TouchableOpacity 
        key={theme.id}
        onPress={() => handleSelect(theme.id)}
        style={[
          styles.cardContainer,
          isSelected && styles.cardSelected // Add border if selected
        ]}
        activeOpacity={0.8}
      >
        {/* The "Screen" Content */}
        <View style={[styles.miniScreen, { backgroundColor: theme.bg }]}>
          
          {/* Dummy Text */}
          <View style={styles.miniTextContainer}>
             <Text style={[styles.miniTitle, { color: theme.text }]}>You are...</Text>
             <View style={[styles.miniLine, { backgroundColor: theme.text, opacity: 0.5 }]} />
             <View style={[styles.miniLine, { backgroundColor: theme.text, opacity: 0.5, width: '60%' }]} />
          </View>

          {/* Bottom Icons (Heart & Share) */}
          <View style={styles.miniIcons}>
             <Feather name="share" size={16} color={theme.icon} />
             <Feather name="heart" size={16} color={theme.icon} />
          </View>

        </View>

        {/* Theme Name Label */}
        <Text style={styles.themeLabel}>{theme.name}</Text>

        {/* Checkmark Badge (Only if selected) */}
        {isSelected && (
            <View style={styles.checkmarkBadge}>
                <Feather name="check" size={14} color="#FFF" />
            </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
            
            {/* --- HEADER --- */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Choose your style</Text>
                <Text style={styles.headerSubtitle}>
                    Pick the vibe that resonates with you.
                </Text>
            </View>

            {/* --- THEME GRID --- */}
            <ScrollView 
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
            >
                {THEMES.map(renderThemeCard)}
            </ScrollView>

            {/* --- FOOTER BUTTON --- */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.mainButton} onPress={handleContinue}>
                    <Text style={styles.mainButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>

        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB", // Background stays Blue for continuity
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // --- HEADER ---
  headerContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0F7FA',
    textAlign: 'center',
  },

  // --- GRID ---
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100, // Space for footer
  },
  
  // --- CARD STYLES ---
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 20,
    alignItems: 'center',
    borderRadius: 18,
    padding: 4, // Space for the selection border
    borderWidth: 3,
    borderColor: 'transparent', // Invisible by default
  },
  cardSelected: {
    borderColor: '#FFFFFF', // White ring when selected
    backgroundColor: 'rgba(255,255,255,0.2)', // Subtle highlight
  },
  
  miniScreen: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-between', // Pushes text to top, icons to bottom
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  
  // Dummy Content Inside Card
  miniTextContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  miniLine: {
    height: 3,
    width: '80%',
    borderRadius: 2,
  },
  
  miniIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 5,
  },

  themeLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  checkmarkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ADE80', // Success Green
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#87CEEB',
  },

  // --- FOOTER ---
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  mainButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005A9C',
  },
});