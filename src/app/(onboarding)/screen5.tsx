import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function TheTone() {
  const { name, focus, struggle } = useLocalSearchParams();

  const handleOptionSelect = (selectedLabel : string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    router.push({
      pathname: "/screen6",
      params: { name, focus, struggle, tone: selectedLabel }
    });
  };

  // UPDATED: Now accepts a 'subtitle' prop
  const OptionButton = ({ label, subtitle}: { label: string, subtitle?: string }) => (
    <TouchableOpacity 
      style={styles.optionCard}
      onPress={() => handleOptionSelect(label)}
    >
      {/* Wrapped text in a View to stack them */}
      <View style={styles.textWrapper}>
        <Text style={styles.optionText}>{label}</Text>
        {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
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
                    How should we speak to you?
                 </Text>
                 <Text style={styles.subText}>
                    Choose the voice that motivates you best.
                 </Text>
              </View>

              {/* Options with Subtitles */}
              <OptionButton 
                label="Compassionate" 
                subtitle='"It is okay to rest. You are enough."'
              />
              <OptionButton 
                label="Empowering" 
                subtitle='"You are a force. Crush this day."'
              />
              <OptionButton 
                label="Stoic" 
                subtitle='"Focus on what you control."'
              />
              <OptionButton 
                label="Spiritual" 
                subtitle='"The universe is aligning for you."'
              />
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
  // NEW: Wrapper to hold Title + Subtitle
  textWrapper: {
    flex: 1,
    paddingRight: 10, // Prevent text from hitting the circle
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700', // Made slightly bolder
    color: '#005A9C',
    marginBottom: 2, // Tiny space between title and subtitle
  },
  // NEW: Subtitle Style (Small & subtle)
  subtitleText: {
    fontSize: 12, 
    color: '#666666',
    fontWeight: '500',
    fontStyle: 'italic',
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