import React, { useMemo, useCallback, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
// Calculate width for grid items (2 columns with spacing)
const GRID_ITEM_WIDTH = (width - 48 - 12) / 2;

export const ProfileSheet = forwardRef<BottomSheet>((props, ref) => {
  // Snap points: Open to 90% of screen height
  const snapPoints = useMemo(() => ['90%'], []);

  const handlePress = () => Haptics.selectionAsync();

  const handleClose = () => {
    // @ts-ignore
    ref?.current?.close();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1} // Closed by default
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      // PREMIUM DARK BLUE BACKGROUND
      backgroundStyle={{ backgroundColor: '#0F172A' }} 
      handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 40 }}
    >
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
          <Feather name="x" size={22} color="#E2E8F0" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Profile</Text>
        
        <TouchableOpacity onPress={handlePress} style={styles.iconButton}>
          <Feather name="settings" size={22} color="#E2E8F0" />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- UNLOCK BANNER (Updated to Blue Theme) --- */}
        <TouchableOpacity style={styles.banner} onPress={handlePress} activeOpacity={0.9}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Unlock all</Text>
            <Text style={styles.bannerSubtitle}>
              Access all categories, affirmations, themes, and remove ads!
            </Text>
          </View>
          {/* Decorative Icon */}
          <MaterialCommunityIcons name="diamond-stone" size={48} color="#1A2F5A" style={{ opacity: 0.8 }} />
        </TouchableOpacity>

        {/* --- STREAK SECTION --- */}
        <View style={styles.streakCard}>
           <View style={styles.streakHeader}>
              <View style={styles.streakCountCircle}>
                  <Text style={styles.streakNumber}>1</Text>
                  <MaterialCommunityIcons name="star-four-points" size={12} color="#38BDF8" style={styles.streakStar} />
              </View>
              <View style={styles.streakInfo}>
                  <Text style={styles.streakTitle}>Your streak</Text>
                  {/* Days Row */}
                  <View style={styles.daysRow}>
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => (
                          <View key={day} style={styles.dayItem}>
                              <Text style={styles.dayText}>{day}</Text>
                              {/* Example: Monday is active */}
                              <View style={[styles.dayDot, i === 0 && styles.dayDotActive]} />
                          </View>
                      ))}
                  </View>
              </View>
           </View>
        </View>

        {/* --- CUSTOMIZE GRID --- */}
        <Text style={styles.sectionTitle}>Customize the app</Text>
        <View style={styles.gridContainer}>
            <GridItem label="App icon" icon="view-grid-outline" onPress={handlePress} />
            <GridItem label="Reminders" icon="bell-outline" onPress={handlePress} />
            <GridItem label="Widgets" icon="widgets-outline" onPress={handlePress} />
            <GridItem label="Alarm" icon="alarm" onPress={handlePress} />
            <GridItem label="Watch" icon="watch" onPress={handlePress} />
            <GridItem label="Self-Growth" icon="leaf" onPress={handlePress} />
        </View>

        {/* --- MY CONTENT GRID --- */}
        <Text style={styles.sectionTitle}>My content</Text>
        <View style={styles.gridContainer}>
            <ContentItem label="Favorites" icon="heart-outline" onPress={handlePress} />
            <ContentItem label="Collections" icon="bookmark-outline" onPress={handlePress} />
            <ContentItem label="My affirmations" icon="fountain-pen-tip" onPress={handlePress} />
            <ContentItem label="History" icon="history" onPress={handlePress} />
        </View>

      </BottomSheetScrollView>
    </BottomSheet>
  );
});

// --- SUB-COMPONENTS ---

const GridItem = ({ label, icon, onPress }: { label: string, icon: any, onPress: () => void }) => (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.gridIconContainer}>
             <MaterialCommunityIcons name={icon} size={32} color="#E2E8F0" style={{ opacity: 0.9 }} />
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
);

const ContentItem = ({ label, icon, onPress }: { label: string, icon: any, onPress: () => void }) => (
    <TouchableOpacity style={[styles.gridCard, styles.contentCard]} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.contentRow}>
            <Text style={styles.cardLabel}>{label}</Text>
            <MaterialCommunityIcons name={icon} size={24} color="#E2E8F0" style={{ opacity: 0.8 }} />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F7FAFC',
    fontFamily: 'System', 
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll Content
  scrollContent: {
    padding: 24,
    paddingBottom: 50,
  },

  // Banner
  banner: {
    backgroundColor: '#DCE6F5', // Soft Blue (Matches Home Screen)
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bannerContent: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTitle: {
    color: '#1A2F5A', // Navy Text
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#334155', // Dark Grey/Blue Text
    fontSize: 13,
    lineHeight: 18,
  },

  // Streak
  streakCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakCountCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#38BDF8', // Bright Blue Border
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  streakStar: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayText: {
    color: '#94A3B8', // Slate Grey Text
    fontSize: 10,
    fontWeight: '600',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155', // Inactive Dot
  },
  dayDotActive: {
    backgroundColor: '#38BDF8', // Active Electric Blue Dot
  },

  // Sections
  sectionTitle: {
    fontSize: 20,
    color: '#E2E8F0',
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'System', 
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  
  // Grid Items
  gridCard: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH, // Square cards
    backgroundColor: 'rgba(255,255,255,0.05)', // Glassmorphism
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  gridIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
  },

  // Content Items (Rectangular)
  contentCard: {
    height: 60, // Shorter height for "My Content" items
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});