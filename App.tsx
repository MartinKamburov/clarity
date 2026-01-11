import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import HomePage from './src/app';

// 1. Import the Overlay
import { AlarmOverlay } from './src/components/AlarmOverlay';

export default function App() {
  const [showAlarm, setShowAlarm] = useState(false);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // --- SNOOZE LOGIC ---
  const handleSnooze = async () => {
    // 1. Close the full-screen overlay immediately
    setShowAlarm(false);

    // 2. Schedule a one-time notification for 9 minutes from now
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Snoozed: Clarity",
        body: "Time for your daily affirmations.",
        sound: true,
        // We keep the category 'ALARM' so when this fires, 
        // the App listener catches it and shows the Overlay again!
        categoryIdentifier: 'ALARM', 
        data: { mode: 'ALARM' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1 * 60, // 9 minutes
        repeats: false,
      },
    });
  };

  useEffect(() => {
    // 1. COLD START CHECK (If app was completely closed)
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const category = response.notification.request.content.categoryIdentifier;
        if (category === 'ALARM') {
          setShowAlarm(true);
        }
      }
    };

    checkInitialNotification();

    // 2. RUNNING CHECK (If app was in background)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const category = response.notification.request.content.categoryIdentifier;
      const actionId = response.actionIdentifier; // <--- Check which button was pressed

      // 1. If they clicked the native "Snooze" button on the notification
      if (category === 'ALARM' && actionId === 'SNOOZE') {
        // Run the snooze logic directly without showing the overlay
        handleSnooze(); 
      }
      // 2. If they clicked the notification body OR "Start Affirmations"
      else if (category === 'ALARM') {
        setShowAlarm(true);
      }
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <HomePage />

      {/* 3. The Alarm Overlay sits ON TOP of everything */}
      {showAlarm && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <AlarmOverlay 
              onDismiss={() => setShowAlarm(false)} 
              onSnooze={handleSnooze} // <--- Pass the new handler here
            />
        </View>
      )}

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}