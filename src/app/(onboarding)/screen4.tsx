import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function TheStruggle() {
  const { name, focus } = useLocalSearchParams();

  const handleOptionSelect = (selectedLabel : string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    router.push({
      pathname: "/screen5",
      params: { name, focus, struggle: selectedLabel }
    });
  };

  const OptionButton = ({ label}: { label: string }) => (
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
                    Thanks for sharing.
                 </Text>
                 <Text style={styles.subText}>
                    And what’s currently holding you back?
                 </Text>
              </View>

              {/* Options */}
              <OptionButton label="Overthinking" />
              <OptionButton label="Procrastination" />
              <OptionButton label="Imposter Syndrome" />
              <OptionButton label="Fear of Failure" />
              <OptionButton label="Negative Self-Talk" />
              <OptionButton label="Loneliness" />
              <OptionButton label="Past Trauma" />
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