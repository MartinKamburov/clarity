import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

const { width } = Dimensions.get('window');

export default function ThirdQuestion() {
  const { name, choice } = useLocalSearchParams();

  // This function handles the press: It grabs the label and moves to the next page immediately
  const handleOptionSelect = (selectedLabel : string) => {
    router.push({
      pathname: "/screen4",
      params: { name: name, choice: selectedLabel }
    });
  };

  // Helper component for the "Cloud Option"
  const OptionButton = ({ label}: { label: string }) => (
    <TouchableOpacity 
      style={styles.optionCard}
      onPress={() => handleOptionSelect(label)}
    >
      {/* Text on the Left */}
      <Text style={styles.optionText}>{label}</Text>

      {/* Empty Circle on the Right */}
      <View style={styles.circle} />
    </TouchableOpacity>
  );

  return (
      <SafeAreaView style={styles.container}>
          {/* Main icon */}
          <Image 
            source={require('../../../assets/ClarityIcon.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* Header Section */}
          <View style={styles.headerContainer}>
             <Text style={styles.headerText}>
                 Great to meet you, {name}!
             </Text>
             <Text style={styles.subText}>
                 What brings you here today?
             </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
             <OptionButton label="Just exploring" />
             <OptionButton label="Looking for a job" />
             <OptionButton label="Building a project" />
          </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // REMOVED: justifyContent: 'center' (This was forcing it to the middle)
    backgroundColor: "#87CEEB",
    // paddingTop: 10, // Adds a tiny bit of breathing room at the top
  },
  heroImage: {
    // REDUCED: Made the image smaller (0.4 instead of 0.6) to save space
    width: width * 0.4, 
    height: width * 0.4,
    marginBottom: 20, // Adds space between image and text
  },
  headerContainer: {
    marginBottom: 30, // Reduced from 40 to keep things tight
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
    color: '#1A365D', // Darker blue for better readability
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 30,
    gap: 15, // Reduced gap slightly so more buttons fit
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18, // Slightly more compact
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#003366', // Darker shadow for better contrast
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
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