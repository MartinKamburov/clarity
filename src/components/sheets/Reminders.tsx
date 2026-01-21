import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, Platform, Alert, Modal, Linking 
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'; 
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Import

// ... Types and Config (keep your existing code here) ...
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
  const insets = useSafeAreaInsets(); // 2. Get Insets
  
  // ... Pickers State & Logic (keep exactly as is) ...
  const [showGeneralStartPicker, setShowGeneralStartPicker] = useState(false);
  const [showGeneralEndPicker, setShowGeneralEndPicker] = useState(false);
  const [showDailyPicker, setShowDailyPicker] = useState(false);
  const [showStreakPicker, setShowStreakPicker] = useState(false);
  const [showFreqModal, setShowFreqModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // ... (Keep checkPermissions, shuffleArray, scheduleAll, saveState, toggleSection, formatTime logic exactly as is) ...
  const checkPermissions = async () => { /*...*/ return true; };
  const scheduleAll = async (newState: RemindersState) => { /*...*/ };
  const saveState = async (updates: Partial<RemindersState>) => { /*...*/ };
  const loadSettings = async () => { /*...*/ };
  const toggleSection = async (key: keyof RemindersState) => { /*...*/ };
  const formatTime = (date: Date) => { return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };

  return (
    <BottomSheetScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ 
        padding: 24,
        gap: 16,
        // 3. THIS FIXES THE HEIGHT LOCKING:
        flexGrow: 1, 
        // 4. THIS FIXES THE ELASTIC SCROLL (Dynamic Padding):
        paddingBottom: insets.bottom + 20 
      }} 
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>Set up your daily reminders to make your affirmations fit your routine</Text>

      {/* ... (Rest of your component UI stays exactly the same) ... */}
      
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

      {/* --- 2. DAILY REMINDERS --- */}
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

      {/* --- 3. STREAK --- */}
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

      {/* --- FOOTER --- */}
      <TouchableOpacity style={styles.premiumButton} activeOpacity={0.9}>
        <Text style={styles.premiumButtonText}>Unlock more reminders</Text>
      </TouchableOpacity>

      {/* ... (Modals code stays the same) ... */}
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
       {/* (Other android pickers here) */}

    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  // REMOVED 'container' style because we are passing it directly in contentContainerStyle
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