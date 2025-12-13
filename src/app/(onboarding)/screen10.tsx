import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ThePermission() {
  const params = useLocalSearchParams(); // Keep passing data forward
  
  // States: 'idle' | 'granted' | 'denied'
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  const handleAction = async () => {
    // 1. If we already have a result, just move to the next screen
    if (permissionStatus !== 'idle') {
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
       router.push({
          pathname: "/screen11", // Aesthetic Choice Screen
          params: params 
       });
       return;
    }

    // 2. Otherwise, request permission from the System
    try {
        const { status } = await Notifications.requestPermissionsAsync();
        
        if (status === 'granted') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPermissionStatus('granted');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setPermissionStatus('denied');
        }
    } catch (error) {
        // Fallback if something fails
        setPermissionStatus('denied');
    }
  };

  // Helper to determine Button Text
  const getButtonText = () => {
      switch (permissionStatus) {
          case 'granted': return "Great, let's continue!";
          case 'denied': return "Skip for now";
          default: return "Enable Notifications";
      }
  };

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
            
            {/* --- ICON VISUAL --- */}
            {/* We use a bell icon or your Cloud logo inside a 'notification bubble' shape */}
            <View style={styles.iconCircle}>
                <Image 
                    source={require('../../../assets/ClarityIcon.png')} 
                    style={styles.heroImage}
                    resizeMode="contain"
                />
                {/* Optional: Add a small badge to look like a notification */}
                <View style={styles.badge} />
            </View>

            {/* --- TEXT CONTENT --- */}
            <View style={styles.textSection}>
                <Text style={styles.headerTitle}>
                    Don't miss a beat
                </Text>
                <Text style={styles.headerSubtitle}>
                    Reading affirmations regularly is key to rewiring your brain. 
                    Let us send you that gentle reminder?
                </Text>
            </View>

            {/* --- DYNAMIC BUTTON --- */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[
                        styles.mainButton, 
                        // Change style based on status
                        permissionStatus === 'denied' && styles.buttonDenied,
                        permissionStatus === 'granted' && styles.buttonGranted
                    ]} 
                    onPress={handleAction}
                >
                    <Animated.Text 
                        // Simple fade animation key helps text transition smoothly
                        key={permissionStatus} 
                        entering={FadeIn.duration(200)}
                        style={[
                            styles.mainButtonText,
                            permissionStatus === 'denied' && styles.textDenied,
                            permissionStatus === 'granted' && styles.textGranted
                        ]}
                    >
                        {getButtonText()}
                    </Animated.Text>
                </TouchableOpacity>

                {/* Helper text for 'idle' state */}
                {permissionStatus === 'idle' && (
                    <Text style={styles.tinyText}>
                        You can change this later in settings
                    </Text>
                )}
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  
  // --- VISUALS ---
  iconCircle: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle glass circle
    borderRadius: width * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  heroImage: {
    width: '60%',
    height: '60%',
  },
  badge: {
    position: 'absolute',
    top: 20,
    right: 25,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B', // Notification Red
    borderWidth: 2,
    borderColor: '#87CEEB',
  },

  // --- TYPOGRAPHY ---
  textSection: {
    marginBottom: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#E0F7FA',
    textAlign: 'center',
    lineHeight: 26,
  },

  // --- BUTTONS ---
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
  tinyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // --- DYNAMIC STYLES ---
  buttonGranted: {
    backgroundColor: '#4ADE80', // Success Green
    borderColor: 'transparent',
  },
  textGranted: {
    color: '#FFFFFF', // White text on green button
  },
  
  buttonDenied: {
    backgroundColor: 'transparent', // See-through
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
  },
  textDenied: {
    color: '#FFFFFF', // White text on transparent button
  },
});