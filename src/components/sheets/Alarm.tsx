import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, Platform, Alert, ScrollView, Linking 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase'; 

// --- TYPES ---
interface AlarmState {
  isEnabled: boolean;
  date: string;
  selectedDays: number[];
  soundId: string;
}

// --- CONFIGURATION ---
const SOUNDS = [
  { id: 'default', name: 'System default' },
  { id: 'bloom', name: 'Bloom' },
  { id: 'aurora', name: 'Aurora' },
  { id: 'bamboo', name: 'Bamboo' },
  { id: 'chord', name: 'Chord' },
  { id: 'circles', name: 'Circles' },
  { id: 'complete', name: 'Complete' },
];

const DAYS = [
  { label: 'S', value: 1 }, 
  { label: 'M', value: 2 },
  { label: 'T', value: 3 },
  { label: 'W', value: 4 },
  { label: 'T', value: 5 },
  { label: 'F', value: 6 },
  { label: 'S', value: 7 },
];

// --- NOTIFICATION HANDLER ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

// Configure the "ALARM" category to show buttons on the notification itself
Notifications.setNotificationCategoryAsync('ALARM', [
  // CHANGE THIS TO TRUE 👇
  { identifier: 'SNOOZE', buttonTitle: 'Snooze', options: { opensAppToForeground: true } },
  { identifier: 'OPEN', buttonTitle: 'Start Affirmations', options: { opensAppToForeground: true } },
]);

// ------------------------------------------------------------------
// PROPS: Add `onAlarmTrigger` so we can tell the Parent App to show the Overlay
// ------------------------------------------------------------------
interface AlarmProps {
  userId?: string;
  onAlarmTrigger?: () => void; 
}

export const Alarm = ({ userId, onAlarmTrigger }: AlarmProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([2, 3, 4, 5, 6]); 
  const [selectedSound, setSelectedSound] = useState(SOUNDS[0]);
  const [view, setView] = useState<'MAIN' | 'SOUNDS'>('MAIN');

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    loadAlarmState();
    checkPermissionsOnMount();

    // LISTENER: Detects when user TAPS the notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const category = response.notification.request.content.categoryIdentifier;
      
      // If the notification was our ALARM
      if (category === 'ALARM' && onAlarmTrigger) {
        onAlarmTrigger(); // <--- Tell App.tsx to show the Full Screen Overlay
      }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  // --- PERMISSIONS ---
  const checkPermissionsOnMount = async () => {
    if (!Device.isDevice) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      // Optional: Logic to prompt user if needed, or stay silent until they toggle switch
    }
  };

  const handlePermissionRequest = async () => {
    if (Platform.OS === 'android') {
      await registerForPushNotificationsAsync();
    } else {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'denied') {
         Linking.openSettings();
      } else {
        await registerForPushNotificationsAsync();
      }
    }
  };

  // --- PERSISTENCE & LOGIC ---
  const loadAlarmState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('ALARM_STATE');
      if (savedState) {
        const parsed: AlarmState = JSON.parse(savedState);
        setIsEnabled(parsed.isEnabled);
        setDate(new Date(parsed.date));
        setSelectedDays(parsed.selectedDays);
        const sound = SOUNDS.find(s => s.id === parsed.soundId) || SOUNDS[0];
        setSelectedSound(sound);
      }
    } catch (e) { console.error(e); }
  };

  const saveAlarmState = async (newState: Partial<AlarmState>, shouldSchedule = false) => {
    try {
      const stateToSave: AlarmState = {
        isEnabled: newState.isEnabled ?? isEnabled,
        date: (newState.date ? new Date(newState.date) : date).toISOString(),
        selectedDays: newState.selectedDays ?? selectedDays,
        soundId: newState.soundId ?? selectedSound.id,
      };

      await AsyncStorage.setItem('ALARM_STATE', JSON.stringify(stateToSave));

      if (userId) {
        const dateObj = new Date(stateToSave.date);
        const timeString = `${dateObj.getHours()}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
        await supabase.from('profiles').update({ notification_time: timeString }).eq('id', userId);
      }

      if (shouldSchedule) {
        if (stateToSave.isEnabled) {
          await scheduleNotifications(new Date(stateToSave.date), stateToSave.selectedDays);
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      }
    } catch (e) { console.error(e); }
  };

  const toggleSwitch = async () => {
    Haptics.selectionAsync();
    const newValue = !isEnabled;
    if (newValue) {
      const hasPermission = await registerForPushNotificationsAsync();
      if (!hasPermission) return;
    }
    setIsEnabled(newValue);
    saveAlarmState({ isEnabled: newValue }, true);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
    saveAlarmState({ date: currentDate.toISOString() }, isEnabled);
  };

  const toggleDay = (dayValue: number) => {
    Haptics.selectionAsync();
    const newDays = selectedDays.includes(dayValue) 
      ? selectedDays.filter((d) => d !== dayValue) 
      : [...selectedDays, dayValue].sort();
    setSelectedDays(newDays);
    saveAlarmState({ selectedDays: newDays }, isEnabled);
  };

  const handleSelectSound = (sound: typeof SOUNDS[0]) => {
    Haptics.selectionAsync();
    setSelectedSound(sound);
    setView('MAIN');
    saveAlarmState({ soundId: sound.id }, false);
  };

  // --- SCHEDULING ---
  const scheduleNotifications = async (triggerDate: Date, days: number[]) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const hour = triggerDate.getHours();
    const minute = triggerDate.getMinutes();

    for (const day of days) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Clarity",
          body: "Time for your daily affirmations.",
          sound: true, 
          categoryIdentifier: 'ALARM', // <--- This links to the buttons
          data: { mode: 'ALARM' },     // <--- Payload to check on open
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          weekday: day,
          repeats: true,
        },
      });
    }
  };

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return false;
      return true;
    }
    return false;
  }

  // --- RENDER (Same UI as before) ---
  if (view === 'SOUNDS') {
    return (
      <Animated.View entering={SlideInRight} exiting={SlideOutRight} style={{ flex: 1 }}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setView('MAIN')} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#E2E8F0" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
          {SOUNDS.map((sound) => (
            <TouchableOpacity 
              key={sound.id} 
              style={[styles.soundItem, selectedSound.id === sound.id && styles.soundItemActive]}
              onPress={() => handleSelectSound(sound)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Feather name={selectedSound.id === sound.id ? "volume-2" : "volume-1"} size={20} color={selectedSound.id === sound.id ? "#38BDF8" : "#94A3B8"} />
                <Text style={[styles.soundText, selectedSound.id === sound.id && styles.soundTextActive]}>{sound.name}</Text>
              </View>
              {selectedSound.id === sound.id && <Feather name="check" size={20} color="#38BDF8" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.description}>Set a daily reminder to center yourself and practice your affirmations.</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ gap: 4 }}>
            <Text style={styles.label}>Enable Alarm</Text>
            <Text style={styles.subLabel}>{isEnabled ? 'On' : 'Off'}</Text>
          </View>
          <Switch trackColor={{ false: '#334155', true: '#38BDF8' }} thumbColor={'#F8FAFC'} ios_backgroundColor="#334155" onValueChange={toggleSwitch} value={isEnabled} />
        </View>
      </View>
      <View style={[styles.card, { opacity: isEnabled ? 1 : 0.5 }]}>
        <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 16 }]}>
          <Text style={styles.label}>Time</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker testID="dateTimePicker" value={date} mode="time" is24Hour={false} onChange={onTimeChange} themeVariant="dark" style={{ width: 100 }} disabled={!isEnabled} />
          ) : (
            <TouchableOpacity onPress={() => isEnabled && setShowPicker(true)} style={styles.androidTimeButton}>
              <Text style={styles.timeText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          )}
        </View>
        {showPicker && Platform.OS === 'android' && <DateTimePicker value={date} mode="time" display="default" onChange={onTimeChange} />}
        <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
          <Text style={[styles.label, { marginBottom: 12 }]}>Repeat</Text>
          <View style={styles.daysContainer}>
            {DAYS.map((day) => {
              const isActive = selectedDays.includes(day.value);
              return (
                <TouchableOpacity key={day.value} onPress={() => isEnabled && toggleDay(day.value)} style={[styles.dayCircle, isActive && styles.dayCircleActive]} activeOpacity={0.7}>
                  <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <TouchableOpacity style={[styles.row, { paddingTop: 16 }]} onPress={() => isEnabled && setView('SOUNDS')} disabled={!isEnabled}>
          <Text style={styles.label}>Sound</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.valueText}>{selectedSound.name}</Text>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, gap: 24 },
  description: { color: '#94A3B8', fontSize: 15, textAlign: 'center', marginBottom: 8, lineHeight: 22 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#F1F5F9', fontSize: 16, fontWeight: '600' },
  subLabel: { color: '#94A3B8', fontSize: 13 },
  valueText: { color: '#94A3B8', fontSize: 16 },
  androidTimeButton: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  timeText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'transparent' },
  dayCircleActive: { backgroundColor: '#E2E8F0', borderColor: '#E2E8F0' },
  dayText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  dayTextActive: { color: '#0F172A', fontWeight: '700' },
  subHeader: { paddingHorizontal: 24, paddingBottom: 0 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { color: '#E2E8F0', fontSize: 16, fontWeight: '600' },
  soundItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'transparent' },
  soundItemActive: { borderColor: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)' },
  soundText: { color: '#94A3B8', fontSize: 16 },
  soundTextActive: { color: '#38BDF8', fontWeight: '600' },
});