import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur'; // npx expo install expo-blur

const { width, height } = Dimensions.get('window');

interface AlarmOverlayProps {
  onDismiss: () => void;
  onSnooze?: () => void;
}

export const AlarmOverlay = ({ onDismiss, onSnooze }: AlarmOverlayProps) => {
  // Play haptics on mount to mimic vibration
  useEffect(() => {
    const interval = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {/* Dark Blur Background */}
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <View style={styles.header}>
            <MaterialCommunityIcons name="weather-sunset" size={60} color="#FDBA74" />
            <Text style={styles.appName}>CLARITY</Text>
            <Text style={styles.label}>Time for affirmations</Text>
        </View>

        <View style={styles.timeContainer}>
            <Text style={styles.time}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        <Animated.View entering={SlideInDown.delay(300)} style={styles.actionContainer}>
            {/* Snooze Button */}
            <TouchableOpacity style={styles.snoozeButton} onPress={onSnooze || onDismiss}>
                <Text style={styles.snoozeText}>Snooze</Text>
            </TouchableOpacity>

            {/* Stop Button */}
            <TouchableOpacity style={styles.stopButton} onPress={onDismiss}>
                <Text style={styles.stopText}>Stop</Text>
            </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    width, 
    height,
    zIndex: 9999, // Super high z-index to cover everything
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 100,
    alignItems: 'center',
  },
  header: { alignItems: 'center', gap: 10 },
  appName: { color: '#FDBA74', fontSize: 14, letterSpacing: 4, fontWeight: '700' },
  label: { color: '#FFF', fontSize: 20, fontWeight: '400', marginTop: 10 },
  timeContainer: { justifyContent: 'center', alignItems: 'center' },
  time: { color: '#FFF', fontSize: 80, fontWeight: '200' },
  actionContainer: { alignItems: 'center', gap: 20, width: width * 0.8 },
  snoozeButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: '100%',
    alignItems: 'center',
  },
  snoozeText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  stopButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 59, 48, 0.2)', // Red tint
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  stopText: { color: '#FF3B30', fontSize: 18, fontWeight: '600' },
});