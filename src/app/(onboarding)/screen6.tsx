import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function TheMood() {
  // Grab all the data collected so far
  const { name, focus, struggle, tone } = useLocalSearchParams();

  const handleOptionSelect = (selectedLabel : string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // LOGIC NOTE: If they picked "Bad" or "Terrible", you will 
    // want to flag this in your database to prioritize "Compassionate" quotes today.
    
    router.push({
      pathname: "/screen7",
      params: { name, focus, struggle, tone, mood: selectedLabel }
    });
  };

  // Reusing your standard button, no subtitle needed here since the emojis explain it
  const OptionButton = ({ label, emoji }: { label: string, emoji: string }) => (
    <TouchableOpacity 
      style={styles.optionCard}
      onPress={() => handleOptionSelect(label)}
    >
      <View style={styles.textWrapper}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.optionText}>{label}</Text>
      </View>
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
                    How have you been feeling lately?
                 </Text>
                 <Text style={styles.subText}>
                    There is no wrong answer. We’ll meet you exactly where you are.
                 </Text>
              </View>

              {/* Mood Options */}
              <OptionButton emoji="🤩" label="Great" />
              <OptionButton emoji="🙂" label="Good" />
              <OptionButton emoji="😐" label="Okay" />
              <OptionButton emoji="😔" label="Bad" />
              <OptionButton emoji="😣" label="Terrible" />

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
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Space between emoji and text
  },
  emoji: {
    fontSize: 24,
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