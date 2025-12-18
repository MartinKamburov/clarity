import React, { useMemo, useCallback, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

const CATEGORIES = [
  { id: 'general', label: 'General', icon: 'orbit', locked: false },
  { id: 'reframe', label: 'Reframe Thoughts (AI)', icon: 'crystal-ball', locked: true },
  { id: 'favorites', label: 'Favorites', icon: 'heart-outline', locked: false },
  { id: 'custom', label: 'My own affirmations', icon: 'feather', locked: false },
];

export const CategoriesSheet = forwardRef<BottomSheet>((props, ref) => {
  const snapPoints = useMemo(() => ['1%', '50%', '90%'], []);

  const handlePress = () => Haptics.selectionAsync();

  const handleClose = () => {
    // @ts-ignore
    ref?.current?.close();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#0F172A' }}
      handleIndicatorStyle={{ backgroundColor: '#A0AEC0', width: 40 }}
    >
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>What do you want to focus on?</Text>
        <TouchableOpacity onPress={handleClose} style={styles.sheetCloseBtn}>
          <Feather name="x" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
        <TouchableOpacity style={styles.mixButton} onPress={handlePress}>
          <Text style={styles.mixButtonText}>Make your own mix</Text>
        </TouchableOpacity>

        <View style={styles.gridContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.card} onPress={handlePress}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={cat.icon as any} size={40} color="#DCE6F5" style={{ opacity: 0.8 }} />
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardLabel}>{cat.label}</Text>
                {cat.locked && <Feather name="lock" size={16} color="#A0AEC0" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 10 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  sheetCloseBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15 },
  sheetContent: { padding: 24, paddingBottom: 50 },
  mixButton: { backgroundColor: '#E6D5C3', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 30 },
  mixButtonText: { color: '#2D3748', fontSize: 16, fontWeight: '700' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: CARD_WIDTH, height: CARD_WIDTH * 1.1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 16, justifyContent: 'space-between' },
  iconContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { color: '#E2E8F0', fontSize: 13, fontWeight: '500', flex: 1, marginRight: 8 },
});