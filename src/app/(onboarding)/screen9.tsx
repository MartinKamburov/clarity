import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function TheHabit() {
  const params = useLocalSearchParams();
  
  // State for the form
  const [frequency, setFrequency] = useState(10);
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(9, 0, 0, 0))); 
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(22, 0, 0, 0)));   

  const handleFrequencyChange = (increment: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFrequency(prev => {
      const newVal = increment ? prev + 1 : prev - 1;
      // CHANGED: Allow it to go down to 0
      return Math.max(0, Math.min(newVal, 30)); 
    });
  };

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    router.push({
      pathname: "/screen10",
      params: { 
        ...params, 
        notification_freq: frequency,
        notification_start: startTime.toISOString(),
        notification_end: endTime.toISOString()
      }
    });
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) setStartTime(selectedDate);
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) setEndTime(selectedDate);
  };

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* --- HEADER --- */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Get affirmations throughout the day</Text>
                <Text style={styles.headerSubtitle}>
                    Reading affirmations regularly will help you reach your goals.
                </Text>
            </View>

            {/* --- PREVIEW CARD --- */}
            <View style={styles.previewContainer}>
                <View style={styles.glassCard}>
                    <View style={styles.notificationHeader}>
                        <View style={styles.smallIcon}>
                             <Image 
                                source={require('../../../assets/ClarityIcon.png')} 
                                style={{ width: 30, height: 25 }}
                                resizeMode="contain"
                             />
                        </View>
                        <Text style={styles.appName}>Clarity</Text>
                        <Text style={styles.timeText}>Now</Text>
                    </View>
                    <Text style={styles.notifTitle}>
                        {frequency >= 1 
                         ? "You're one..." 
                         : "Nothing to see."}
                    </Text>
                    <Text style={styles.notifBody}>
                       {frequency === 0 
                         ? "Notifications are currently turned off." 
                         : "You're one decision away from momentum."}
                    </Text>
                </View>
            </View>


            {/* --- CONTROLS SECTION --- */}
            <View style={styles.controlsContainer}>
                
                {/* 1. Frequency Control (Always Visible) */}
                <View style={styles.controlRow}>
                    <Text style={styles.label}>How many</Text>
                    <View style={styles.stepper}>
                        <TouchableOpacity 
                            style={styles.circleButton} 
                            onPress={() => handleFrequencyChange(false)}
                        >
                            <Text style={styles.buttonText}>-</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.valueText}>{frequency}x</Text>
                        
                        <TouchableOpacity 
                            style={styles.circleButton} 
                            onPress={() => handleFrequencyChange(true)}
                        >
                            <Text style={styles.buttonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* CONDITIONAL: Start Time (Only if frequency > 0) */}
                {frequency > 0 && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.controlRow}>
                            {/* If count is 1, label it "Time", otherwise "Start at" */}
                            <Text style={styles.label}>
                                {frequency === 1 ? "Time" : "Start at"}
                            </Text>
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={onStartTimeChange}
                                themeVariant="light"
                                style={{ width: 100 }}
                            />
                        </View>
                    </>
                )}

                {/* CONDITIONAL: End Time (Only if frequency > 1) */}
                {frequency > 1 && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.controlRow}>
                            <Text style={styles.label}>End at</Text>
                            <DateTimePicker
                                value={endTime}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={onEndTimeChange}
                                themeVariant="light"
                                style={{ width: 100 }}
                            />
                        </View>
                    </>
                )}

            </View>

        </ScrollView>

        {/* --- BOTTOM BUTTON --- */}
        <View style={styles.footer}>
            <TouchableOpacity style={styles.mainButton} onPress={handleContinue}>
                <Text style={styles.mainButtonText}>
                    {frequency === 0 ? "Skip for Now" : "Allow and Save"}
                </Text>
            </TouchableOpacity>
        </View>

      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  
  // --- HEADER ---
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0F7FA',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // --- PREVIEW CARD ---
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  appName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#E0F7FA',
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  // --- CONTROLS ---
  controlsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  label: {
    fontSize: 18,
    color: '#1A365D',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  
  // --- STEPPER ---
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#005A9C',
    marginTop: -2,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A365D',
    minWidth: 40,
    textAlign: 'center',
  },

  // --- FOOTER ---
  footer: {
    position: 'absolute',
    bottom: 50,
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