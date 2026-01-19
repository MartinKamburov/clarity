import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function TheBelief() {
  // 1. Grab all data collected so far
  const { name, focus, struggle, tone, mood } = useLocalSearchParams();

  const handleOptionSelect = (selectedLabel: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 2. Pass everything to the next screen (Screen 9: The Habit)
    // The 'manifestation' tag is now added to your user profile data
    router.push({
      pathname: "/screen9", 
      params: { 
        name, 
        focus, 
        struggle, 
        tone, 
        mood, 
        manifestation: selectedLabel
      }
    });
  };

  const OptionButton = ({ label }: { label: string }) => (
    <TouchableOpacity 
      style={styles.optionCard}
      onPress={() => handleOptionSelect(label)}
    >
      <Text style={styles.optionText}>{label}</Text>
      <View style={styles.circle} />
    </TouchableOpacity>
  );

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scrollWrapper}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
            >
              {/* Main icon */}
              <Image 
                source={require('../../../assets/ClarityIcon.png')} 
                style={styles.heroImage}
                resizeMode="contain"
              />

              {/* Header Section */}
              <View style={styles.headerContainer}>
                 <Text style={styles.headerText}>
                    Do you believe in the power of manifestation?
                 </Text>
                 <Text style={styles.subText}>
                    This helps us tailor your spiritual journey.
                 </Text>
              </View>

              {/* Options */}
              <OptionButton label="Yes" />
              <OptionButton label="No" />
              <OptionButton label="I'm open to it" />

            </ScrollView>
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
    paddingBottom: 40,
    gap: 15,
  },
  
  heroImage: {
    width: width * 0.3, 
    height: width * 0.25,
    alignSelf: 'center',
  },
  
  headerContainer: {
    marginBottom: 30,
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
  
  // --- CARD STYLES ---
  optionCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20, // Slightly taller for these short options
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
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005A9C',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#005A9C',
    backgroundColor: 'transparent',
  }
});