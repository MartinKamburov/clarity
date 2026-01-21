import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native'; // Added StyleSheet
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // REQUIRED FIX
import * as Notifications from 'expo-notifications';
import HomePage from './src/app';
import { AlarmOverlay } from './src/components/AlarmOverlay';

export default function App() {
  const [showAlarm, setShowAlarm] = useState(false);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const handleSnooze = async () => {
    setShowAlarm(false);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Snoozed: Clarity",
        body: "Time for your daily affirmations.",
        sound: true,
        categoryIdentifier: 'ALARM', 
        data: { mode: 'ALARM' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1 * 60,
        repeats: false,
      },
    });
  };

  useEffect(() => {
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response && response.notification.request.content.categoryIdentifier === 'ALARM') {
        setShowAlarm(true);
      }
    };
    checkInitialNotification();

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const category = response.notification.request.content.categoryIdentifier;
      const actionId = response.actionIdentifier;

      if (category === 'ALARM' && actionId === 'SNOOZE') {
        handleSnooze(); 
      } else if (category === 'ALARM') {
        setShowAlarm(true);
      }
    });

    return () => responseListener.current?.remove();
  }, []);

  return (
    // FIX: GestureHandlerRootView MUST be the parent of the BottomSheet logic
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HomePage />
        {showAlarm && (
          <View style={styles.overlayContainer}>
            <AlarmOverlay 
              onDismiss={() => setShowAlarm(false)} 
              onSnooze={handleSnooze} 
            />
          </View>
        )}
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});