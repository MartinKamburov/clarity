import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

export default function SecondQuestion() {
  const { name } = useLocalSearchParams();

  // This function handles the press: It grabs the label and moves to the next page immediately
  const handleOptionSelect = (selectedLabel : string) => {
    router.push({
      pathname: "/screen3",
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
    justifyContent: 'center',
    backgroundColor: "#F0F8FF" // AliceBlue
  },
  headerContainer: {
    marginBottom: 40,
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
    color: '#555',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 30,
    gap: 20, // Increased gap for a airier feel
  },
  
  // -- The Cloud Button Style --
  optionCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 25,
    
    // Layout for Text + Circle
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Pushes text left, circle right

    // Cloud Shadow
    shadowColor: '#A0C4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#005A9C', // Using the blue text immediately
  },
  
  // -- The Empty Bullet Point Circle --
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12, // Half of width/height makes it a perfect circle
    borderWidth: 2,
    borderColor: '#005A9C', // Blue border
    backgroundColor: 'transparent', // Empty inside
  }
});