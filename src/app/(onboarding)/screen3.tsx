import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function TheFocus() {
  const { name } = useLocalSearchParams();

  // 1. STATE: Track selected items
  const [selectedFocuses, setSelectedFocuses] = useState<string[]>([]);

  // 2. LOGIC: Toggle selection
  const toggleOption = (label: string) => {
    Haptics.selectionAsync();

    setSelectedFocuses(current => {
      if (current.includes(label)) {
        return current.filter(item => item !== label);
      } else {
        return [...current, label];
      }
    });
  };

  // 3. LOGIC: Continue to next screen
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    router.push({
      pathname: "/screen4",
      params: { 
        name, 
        // Pass array as string
        focus: JSON.stringify(selectedFocuses) 
      }
    });
  };

  const OptionButton = ({ label }: { label: string }) => {
    const isSelected = selectedFocuses.includes(label);

    return (
      <TouchableOpacity 
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
        onPress={() => toggleOption(label)}
        activeOpacity={0.8}
      >
        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
          {label}
        </Text>
        
        {/* Visual Checkmark */}
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
                 <Text style={styles.headerText}>Great to meet you, {name}!</Text>
                 <Text style={styles.subText}>What brings you here today?</Text>
                 <Text style={styles.subText}>(Select all that apply)</Text>
              </View>

              <OptionButton label="Anxiety & Stress" />
              <OptionButton label="Self-Love" />
              <OptionButton label="Career Growth" />
              <OptionButton label="Confidence" />
              <OptionButton label="Relationships" />
              <OptionButton label="Health & Body" />
              <OptionButton label="Exploring" />
              
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* 4. FOOTER BUTTON */}
            <View style={styles.footerContainer}>
              <TouchableOpacity 
                style={[
                  styles.continueButton, 
                  selectedFocuses.length === 0 && styles.continueButtonDisabled
                ]}
                onPress={handleContinue}
                disabled={selectedFocuses.length === 0}
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
    paddingBottom: 100, // Space for footer
    gap: 15,
  },
  
  heroImage: {
    width: width * 0.3, 
    height: width * 0.25,
    alignSelf: 'center',
  },
  
  headerContainer: {
    // marginBottom: 30,
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
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#005A9C',
    borderColor: '#004080',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#005A9C',
  },
  optionTextSelected: {
    color: '#FFFFFF',
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
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#005A9C',
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
    backgroundColor: '#8FBAD8',
    shadowOpacity: 0,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});