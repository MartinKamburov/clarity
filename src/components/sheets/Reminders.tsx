import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, Alert, Modal, Linking 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

// --- TYPES ---
interface ReminderConfig {
  enabled: boolean;
  time: Date;
}

interface GeneralConfig {
  enabled: boolean;
  startTime: Date;
  endTime: Date;
  frequency: number;
}

interface RemindersState {
  general: GeneralConfig;
  daily: ReminderConfig;
  streak: ReminderConfig;
}

const DEFAULT_STATE: RemindersState = {
  general: {
    enabled: false,
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(22, 0, 0, 0)),
    frequency: 5,
  },
  daily: {
    enabled: false,
    time: new Date(new Date().setHours(10, 0, 0, 0)),
  },
  streak: {
    enabled: false,
    time: new Date(new Date().setHours(20, 0, 0, 0)),
  },
};

const FREQUENCY_OPTIONS = [3, 5, 7, 10, 12];

export const Reminders = ({ userId }: { userId?: string }) => {
  const [state, setState] = useState<RemindersState>(DEFAULT_STATE);
  
  // Pickers State
  const [showGeneralStartPicker, setShowGeneralStartPicker] = useState(false);
  const [showGeneralEndPicker, setShowGeneralEndPicker] = useState(false);
  const [showDailyPicker, setShowDailyPicker] = useState(false);
  const [showStreakPicker, setShowStreakPicker] = useState(false);
  const [showFreqModal, setShowFreqModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // --- LOGIC: PERMISSIONS ---
  const checkPermissions = async () => {
    if (!Device.isDevice) return true;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
        return true;
    }

    if (existingStatus === 'undetermined') {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    }

    return new Promise<boolean>((resolve) => {
        Alert.alert(
            "Notifications are off",
            "To get reminders, go to your device settings and allow notifications.",
            [
                { 
                    text: "Maybe later", 
                    style: "cancel", 
                    onPress: () => resolve(false) 
                },
                { 
                    text: "Open settings", 
                    onPress: () => {
                        Linking.openSettings();
                        resolve(false); 
                    } 
                }
            ]
        );
    });
  };

  // --- HELPER: Fisher-Yates Shuffle ---
  const shuffleArray = (array: string[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // --- LOGIC: SCHEDULING ---
  const scheduleAll = async (newState: RemindersState) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (newState.general.enabled) {
      await scheduleGeneralReminders(newState.general);
    }

    if (newState.daily.enabled) {
      await scheduleSingleRecurring(
        "Daily Practice", 
        "Take a moment to center yourself.", 
        newState.daily.time
      );
    }

    if (newState.streak.enabled) {
      await scheduleSingleRecurring(
        "Keep your streak alive!", 
        "Don't forget to open Clarity today.", 
        newState.streak.time
      );
    }
  };

  const scheduleSingleRecurring = async (title: string, body: string, date: Date) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
      },
    });
  };

  const scheduleGeneralReminders = async (config: GeneralConfig) => {
    let quotes = ["You are enough.", "Breathe in, breathe out.", "Today is a new day."];
    
    // 1. Fetch Favorites
    if (userId) {
      try {
        const { data, error } = await supabase
            .from('favorites')
            .select(`quotes (*)`) 
            .eq('user_id', userId);

        if (!error && data && data.length > 0) {
            const fetchedQuotes = data
                .map((item: any) => item.quotes?.content)
                .filter((content: any) => typeof content === 'string' && content.length > 0);
            
            if (fetchedQuotes.length > 0) {
                quotes = fetchedQuotes;
            }
        }
      } catch (err) {
        console.log("Error fetching quotes for reminders:", err);
      }
    }

    // 2. SHUFFLE THE QUOTES (The Fix for Repeats)
    const shuffledQuotes = shuffleArray(quotes);

    // 3. Calculate Times
    const startTotalMinutes = (config.startTime.getHours() * 60) + config.startTime.getMinutes();
    let endTotalMinutes = (config.endTime.getHours() * 60) + config.endTime.getMinutes();

    if (endTotalMinutes <= startTotalMinutes) {
        endTotalMinutes += 24 * 60; 
    }

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const intervalMinutes = durationMinutes / config.frequency;

    // console.log(`LOG Scheduling ${config.frequency} notifications between minutes ${startTotalMinutes} and ${endTotalMinutes}`);

    for (let i = 0; i < config.frequency; i++) {
      // Calculate Time with Jitter
      const jitter = Math.floor(Math.random() * (intervalMinutes * 0.5)); 
      let scheduledMinute = Math.floor(startTotalMinutes + (i * intervalMinutes) + jitter);

      if (scheduledMinute >= 24 * 60) {
          scheduledMinute -= 24 * 60;
      }

      const h = Math.floor(scheduledMinute / 60);
      const m = scheduledMinute % 60;

      // 4. PICK UNIQUE QUOTE using Modulo on the SHUFFLED list
      const selectedQuote = shuffledQuotes[i % shuffledQuotes.length];

      // --- CONSOLE LOG FOR VERIFICATION ---
      // This will show up in your terminal
    //   const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    //   console.log(`LOG Scheduled notification at ${timeString} - "${selectedQuote}"`);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Clarity",
          body: selectedQuote,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: h,
          minute: m,
          repeats: true,
        },
      });
    }
  };

  // --- LOGIC: STATE MANAGEMENT ---
  const saveState = async (updates: Partial<RemindersState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    await AsyncStorage.setItem('REMINDERS_SETTINGS', JSON.stringify(newState));
    scheduleAll(newState);
  };

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('REMINDERS_SETTINGS');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.general.startTime = new Date(parsed.general.startTime);
        parsed.general.endTime = new Date(parsed.general.endTime);
        parsed.daily.time = new Date(parsed.daily.time);
        parsed.streak.time = new Date(parsed.streak.time);
        setState(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSection = async (key: keyof RemindersState) => {
    Haptics.selectionAsync();
    
    if (!state[key].enabled) {
        const hasPerm = await checkPermissions();
        if (!hasPerm) return;
    }

    const updatedSection = { ...state[key], enabled: !state[key].enabled };
    saveState({ [key]: updatedSection });
  };

  // --- UI COMPONENTS ---
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Set up your daily reminders to make your affirmations fit your routine</Text>

      {/* --- 1. GENERAL REMINDERS --- */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View>
                <Text style={styles.cardTitle}>General</Text>
                <Text style={styles.cardSubtitle}>
                    {state.general.frequency}x • {formatTime(state.general.startTime)}-{formatTime(state.general.endTime)}
                </Text>
            </View>
            <Switch
                trackColor={{ false: '#334155', true: '#38BDF8' }}
                thumbColor={'#F8FAFC'}
                ios_backgroundColor="#334155"
                onValueChange={() => toggleSection('general')}
                value={state.general.enabled}
            />
        </View>

        {state.general.enabled && (
            <Animated.View entering={FadeInDown} layout={Layout} style={styles.expandedContent}>
                <View style={styles.divider} />
                
                {/* Frequency */}
                <TouchableOpacity style={styles.settingRow} onPress={() => setShowFreqModal(true)}>
                    <Text style={styles.settingLabel}>Frequency</Text>
                    <View style={styles.settingValueContainer}>
                        <Text style={styles.settingValue}>{state.general.frequency}x</Text>
                        <Feather name="chevron-right" size={16} color="#94A3B8" />
                    </View>
                </TouchableOpacity>

                {/* Start Time */}
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Start Time</Text>
                    {Platform.OS === 'ios' ? (
                        <DateTimePicker 
                            value={state.general.startTime} 
                            mode="time" 
                            themeVariant="dark"
                            onChange={(e, d) => d && saveState({ general: { ...state.general, startTime: d } })}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setShowGeneralStartPicker(true)}>
                             <Text style={styles.settingValue}>{formatTime(state.general.startTime)}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* End Time */}
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>End Time</Text>
                    {Platform.OS === 'ios' ? (
                         <DateTimePicker 
                            value={state.general.endTime} 
                            mode="time" 
                            themeVariant="dark"
                            onChange={(e, d) => d && saveState({ general: { ...state.general, endTime: d } })}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setShowGeneralEndPicker(true)}>
                             <Text style={styles.settingValue}>{formatTime(state.general.endTime)}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        )}
      </View>

      {/* --- 2. DAILY WRITING/PRACTICE --- */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View>
                <Text style={styles.cardTitle}>Daily practice reminders</Text>
                <Text style={styles.cardSubtitle}>1x • Every day</Text>
            </View>
            <Switch
                trackColor={{ false: '#334155', true: '#38BDF8' }}
                thumbColor={'#F8FAFC'}
                ios_backgroundColor="#334155"
                onValueChange={() => toggleSection('daily')}
                value={state.daily.enabled}
            />
        </View>
        {state.daily.enabled && (
             <Animated.View entering={FadeInDown} layout={Layout} style={styles.expandedContent}>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Time</Text>
                    {Platform.OS === 'ios' ? (
                         <DateTimePicker 
                            value={state.daily.time} 
                            mode="time" 
                            themeVariant="dark"
                            onChange={(e, d) => d && saveState({ daily: { ...state.daily, time: d } })}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setShowDailyPicker(true)}>
                             <Text style={styles.settingValue}>{formatTime(state.daily.time)}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        )}
      </View>

      {/* --- 3. STREAK REMINDER --- */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View>
                <Text style={styles.cardTitle}>Streak reminder</Text>
                <Text style={styles.cardSubtitle}>1x • Every day</Text>
            </View>
            <Switch
                trackColor={{ false: '#334155', true: '#38BDF8' }}
                thumbColor={'#F8FAFC'}
                ios_backgroundColor="#334155"
                onValueChange={() => toggleSection('streak')}
                value={state.streak.enabled}
            />
        </View>
        {state.streak.enabled && (
             <Animated.View entering={FadeInDown} layout={Layout} style={styles.expandedContent}>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Time</Text>
                    {Platform.OS === 'ios' ? (
                         <DateTimePicker 
                            value={state.streak.time} 
                            mode="time" 
                            themeVariant="dark"
                            onChange={(e, d) => d && saveState({ streak: { ...state.streak, time: d } })}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setShowStreakPicker(true)}>
                             <Text style={styles.settingValue}>{formatTime(state.streak.time)}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        )}
      </View>

      {/* --- 4. FOOTER --- */}
      <TouchableOpacity style={styles.premiumButton} activeOpacity={0.9}>
        <Text style={styles.premiumButtonText}>Unlock more reminders</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />

      {/* --- MODALS --- */}
      <Modal visible={showFreqModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How many times?</Text>
                {FREQUENCY_OPTIONS.map(num => (
                    <TouchableOpacity 
                        key={num} 
                        style={[styles.modalOption, state.general.frequency === num && styles.modalOptionActive]}
                        onPress={() => {
                            saveState({ general: { ...state.general, frequency: num } });
                            setShowFreqModal(false);
                        }}
                    >
                        <Text style={[styles.modalOptionText, state.general.frequency === num && styles.modalOptionTextActive]}>
                            {num}x per day
                        </Text>
                        {state.general.frequency === num && <Feather name="check" size={18} color="#0F172A" />}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.modalClose} onPress={() => setShowFreqModal(false)}>
                    <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {showGeneralStartPicker && Platform.OS === 'android' && (
        <DateTimePicker
            value={state.general.startTime}
            mode="time"
            display="default"
            onChange={(e, d) => {
                setShowGeneralStartPicker(false);
                if(d) saveState({ general: { ...state.general, startTime: d } });
            }}
        />
      )}
      
       {/* Other Android pickers can go here */}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  headerTitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginBottom: 16, lineHeight: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#F1F5F9', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#94A3B8' },
  expandedContent: { paddingHorizontal: 20, paddingBottom: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  settingLabel: { fontSize: 15, color: '#E2E8F0' },
  settingValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { fontSize: 15, color: '#38BDF8', fontWeight: '500' },
  premiumButton: {
    backgroundColor: '#E2E8F0',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  premiumButtonText: { color: '#0F172A', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', width: '100%', maxWidth: 320, borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 20, textAlign: 'center' },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalOptionActive: { backgroundColor: '#E2E8F0', marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 12 },
  modalOptionText: { fontSize: 16, color: '#CBD5E1' },
  modalOptionTextActive: { color: '#0F172A', fontWeight: '600' },
  modalClose: { marginTop: 20, alignItems: 'center' },
  modalCloseText: { color: '#94A3B8', fontSize: 16 },
});