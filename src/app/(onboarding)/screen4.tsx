import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function TheStruggle() {
  const { name, focus } = useLocalSearchParams();

  // 1. STATE: Track an array of selected items
  const [selectedStruggles, setSelectedStruggles] = useState<string[]>([]);

  // 2. LOGIC: Toggle selection on click
  const toggleOption = (label: string) => {
    Haptics.selectionAsync(); // Light tap feeling

    setSelectedStruggles(current => {
      if (current.includes(label)) {
        // If already selected, remove it
        return current.filter(item => item !== label);
      } else {
        // If not selected, add it
        return [...current, label];
      }
    });
  };

  // 3. LOGIC: Move to next screen
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    router.push({
      pathname: "/screen5",
      params: { 
        name, 
        focus, 
        // Pass the array as a string so it travels safely to the next screen
        struggle: JSON.stringify(selectedStruggles) 
      }
    });
  };

  const OptionButton = ({ label }: { label: string }) => {
    const isSelected = selectedStruggles.includes(label);

    return (
      <TouchableOpacity 
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
        onPress={() => toggleOption(label)}
        activeOpacity={0.8}
      >
        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
          {label}
        </Text>
        
        {/* Visual Checkmark Logic */}
        <View style={[styles.circle, isSelected && styles.circleSelected]}>
           {isSelected && <View style={styles.innerDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scrollWrapper}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
              <Image 
                source={require('../../../assets/ClarityIcon.png')} 
                style={styles.heroImage}
                resizeMode="contain"
              />

              <View style={styles.headerContainer}>
                 <Text style={styles.headerText}>Thanks for sharing.</Text>
                 <Text style={styles.subText}>And what’s currently holding you back?</Text>
                 <Text style={styles.subText}>(Select all that apply)</Text>
              </View>

              <OptionButton label="Overthinking" />
              <OptionButton label="Procrastination" />
              <OptionButton label="Imposter Syndrome" />
              <OptionButton label="Fear of Failure" />
              <OptionButton label="Negative Self-Talk" />
              <OptionButton label="Loneliness" />
              <OptionButton label="Past Trauma" />

              {/* Spacer to push button down if list is short */}
              <View style={{ height: 20 }} />

            </ScrollView>

            {/* 4. NEW: Floating Continue Button */}
            <View style={styles.footerContainer}>
              <TouchableOpacity 
                style={[
                  styles.continueButton, 
                  selectedStruggles.length === 0 && styles.continueButtonDisabled
                ]}
                onPress={handleContinue}
                disabled={selectedStruggles.length === 0}
              >
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </View>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  scrollWrapper: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 100, // Extra padding for the footer button
    gap: 15,
  },
  
  heroImage: {
    width: width * 0.3, 
    height: width * 0.25,
    alignSelf: 'center',
  },
  
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005A9C',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#1A365D',
    textAlign: 'center',
  },

  // --- OPTION STYLES ---
  optionCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Shadow
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent', // Invisible border normally
  },
  optionCardSelected: {
    backgroundColor: '#005A9C', // Blue background when selected
    borderColor: '#004080',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#005A9C',
  },
  optionTextSelected: {
    color: '#FFFFFF', // White text when selected
  },

  // --- CHECKBOX STYLES ---
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#005A9C',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    borderColor: '#FFFFFF', // White border when selected
    backgroundColor: '#FFFFFF',
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#005A9C', // Blue dot inside
  },

  // --- FOOTER BUTTON ---
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
  continueButton: {
    backgroundColor: '#005A9C',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#8FBAD8', // Lighter/Greyed out blue
    shadowOpacity: 0,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});