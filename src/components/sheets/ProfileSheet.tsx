import React, { useMemo, useCallback, forwardRef, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  runOnJS 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStreak } from '../../hooks/useStreak';
import { format, addDays, isAfter, isSameDay, subDays } from 'date-fns';
import { StreakShareCard, StreakShareCardRef } from '../StreakShareCard';

import { FavoritesList } from './FavoritesList';
import { HistoryList } from './HistoryList';
import { Alarm } from './Alarm';
import { Reminders } from './Reminders';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48 - 12) / 2;

interface ProfileSheetProps {
  userId?: string; 
}

export const ProfileSheet = forwardRef<BottomSheet, ProfileSheetProps>((props, ref) => {
  const insets = useSafeAreaInsets();
  
  const snapPoints = useMemo(() => ['85%'], []);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const slideAnim = useSharedValue(0); 

  // Data
  const { streak, activityLog } = useStreak(props.userId);
  const shareCardRef = useRef<StreakShareCardRef>(null);

  const today = new Date();
  const weekWindow = Array.from({ length: 7 }).map((_, i) => {
      return addDays(subDays(today, 4), i); 
  });

  // --- HANDLERS ---
  const handlePress = () => Haptics.selectionAsync();
  const handleClose = () => {
    // @ts-ignore
    ref?.current?.close();
  };

  const handleSharePress = async () => {
    Haptics.selectionAsync();
    if (shareCardRef.current) {
        await shareCardRef.current.shareStreak();
    }
  };

  // --- NAVIGATION ---
  const openSubPage = (pageTitle: string) => {
    Haptics.selectionAsync();
    setSelectedPage(pageTitle);
    slideAnim.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
  };

  const closeSubPage = () => {
    Haptics.selectionAsync();
    slideAnim.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished) {
        runOnJS(setSelectedPage)(null);
      }
    });
  };

  const subPageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: (1 - slideAnim.value) * width } 
      ],
    };
  });

  const mainMenuAnimStyle = useAnimatedStyle(() => {
    return {
        transform: [
            { translateX: -slideAnim.value * (width * 0.3) }, 
        ],
        opacity: 1 - slideAnim.value, 
    };
  });

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const renderSubPageContent = () => {
    if (selectedPage === 'Favorites') return <FavoritesList userId={props.userId} />;
    if (selectedPage === 'History') return <HistoryList userId={props.userId} />;
    if (selectedPage === 'Alarm') return <Alarm />;
    if (selectedPage === 'Reminders') return <Reminders userId={props.userId} />;
    
    if (selectedPage === 'My affirmations') {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <MaterialCommunityIcons name="fountain-pen-tip" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.subPagePlaceholderText}>Your custom affirmations will appear here.</Text>
            </View>
        );
    }

    return (
        <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="tools" size={48} color="rgba(255,255,255,0.1)" />
            <Text style={styles.subPagePlaceholderText}>Settings for {selectedPage} coming soon.</Text>
        </View>
    );
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      activeOffsetY={[-1, 1]}
      enablePanDownToClose={selectedPage === null} 
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#0F172A' }} 
      handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 40 }}
    >
      <View style={{ flex: 1, overflow: 'hidden' }}>
        
        {/* === LAYER 1: MAIN CONTENT === */}
        <Animated.View 
          pointerEvents={selectedPage ? 'none' : 'auto'}
          style={[{ flex: 1 }, mainMenuAnimStyle]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
              <Feather name="x" size={22} color="#E2E8F0" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={handlePress} style={styles.iconButton}>
              <Feather name="settings" size={22} color="#E2E8F0" />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ 
                padding: 24, 
                paddingBottom: insets.bottom + 150, 
                flexGrow: 1 
            }} 
            showsVerticalScrollIndicator={false}
          >
            {/* UNLOCK BANNER */}
            <TouchableOpacity style={styles.banner} onPress={handlePress} activeOpacity={0.9}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Unlock all</Text>
                <Text style={styles.bannerSubtitle}>Access all categories, affirmations, themes, and remove ads!</Text>
              </View>
              <MaterialCommunityIcons name="diamond-stone" size={48} color="#1A2F5A" style={{ opacity: 0.8 }} />
            </TouchableOpacity>

            {/* STREAK CARD */}
            <View style={styles.streakCard}>
               <StreakShareCard ref={shareCardRef} streak={streak} />
               <View style={styles.streakLeftContainer}>
                  <View style={styles.bigRing}>
                      <Text style={styles.bigStreakNumber}>{streak}</Text>
                      <Text style={styles.bigStreakLabel}>{streak === 1 ? 'day' : 'days'}</Text>
                      <MaterialCommunityIcons name="star-four-points" size={16} color="#38BDF8" style={styles.sparkleIcon} />
                  </View>
               </View>

               <View style={styles.streakRightContainer}>
                  <View style={styles.streakHeaderRow}>
                      <Text style={styles.streakTitle}>Your streak</Text>
                      <TouchableOpacity onPress={handleSharePress} hitSlop={10}>
                         <Feather name="share" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                  </View>

                  <View style={styles.daysRow}>
                    {weekWindow.map((dayDate) => {
                        const dayLabel = format(dayDate, 'EEEEE'); 
                        const dateStr = format(dayDate, 'yyyy-MM-dd');
                        const isToday = isSameDay(dayDate, today);
                        const isFuture = isAfter(dayDate, today);
                        const loggedIn = activityLog.includes(dateStr);
                        
                        let bubbleStyle = styles.bubbleFuture;
                        let icon = null;
                        if (loggedIn) {
                            bubbleStyle = styles.bubbleSuccess; 
                            icon = <Feather name="check" size={10} color="#FFF" strokeWidth={4} />;
                        } else if (!isFuture && !loggedIn) {
                            bubbleStyle = styles.bubbleMissed; 
                            icon = <Feather name="x" size={10} color="#FFF" strokeWidth={4} />;
                        }

                        return (
                            <View key={dateStr} style={styles.dayColumn}>
                                <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{dayLabel}</Text>
                                <View style={bubbleStyle}>{icon}</View>
                            </View>
                        );
                    })}
                  </View>
               </View>
            </View>

            {/* CUSTOMIZE GRID */}
            <Text style={styles.sectionTitle}>Customize</Text>
            <View style={styles.gridContainer}>
                <GridItem label="App icon" icon="view-grid-outline" onPress={() => openSubPage("App icon")} />
                <GridItem label="Reminders" icon="bell-outline" onPress={() => openSubPage("Reminders")} />
                <GridItem label="Widgets" icon="widgets-outline" onPress={() => openSubPage("Widgets")} />
                <GridItem label="Alarm" icon="alarm" onPress={() => openSubPage("Alarm")} />
            </View>

            {/* MY CONTENT GRID */}
            <Text style={styles.sectionTitle}>My content</Text>
            <View style={styles.gridContainer}>
                <ContentItem label="Favorites" icon="heart-outline" onPress={() => openSubPage("Favorites")} />
                <ContentItem label="Collections" icon="bookmark-outline" onPress={() => openSubPage("Collections")} />
                <ContentItem label="My affirmations" icon="fountain-pen-tip" onPress={() => openSubPage("My affirmations")} />
                <ContentItem label="History" icon="history" onPress={() => openSubPage("History")} />
            </View>

          </BottomSheetScrollView>
        </Animated.View>

        {/* === LAYER 2: DETAIL SUB-PAGE === */}
        <Animated.View 
            pointerEvents={selectedPage ? 'auto' : 'none'}
            style={[styles.subPageContainer, subPageStyle]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={closeSubPage} style={styles.iconButton}>
              <Feather name="chevron-left" size={24} color="#E2E8F0" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedPage}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={{ flex: 1 }}>
             {selectedPage && renderSubPageContent()}
          </View>
        </Animated.View>

      </View>
    </BottomSheet>
  );
});

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
  banner: {
    backgroundColor: '#DCE6F5', 
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bannerContent: { flex: 1, paddingRight: 10 },
  bannerTitle: { color: '#1A2F5A', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  bannerSubtitle: { color: '#334155', fontSize: 13, lineHeight: 18 },
  streakCard: {
    backgroundColor: 'rgba(0,0,0,0.25)', 
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  streakLeftContainer: { alignItems: 'center', justifyContent: 'center' },
  bigRing: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  bigStreakNumber: { fontSize: 24, fontWeight: '800', color: '#FFF', lineHeight: 24 },
  bigStreakLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  sparkleIcon: { position: 'absolute', top: 0, right: 0, backgroundColor: '#0F172A', borderRadius: 8 },
  streakRightContainer: { flex: 1 },
  streakHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingRight: 4 },
  streakTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayColumn: { alignItems: 'center', gap: 8 },
  dayLabel: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  dayLabelActive: { color: '#FFF', fontWeight: '700' },
  bubbleFuture: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  bubbleSuccess: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#38BDF8', alignItems: 'center', justifyContent: 'center' },
  bubbleMissed: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 20, color: '#E2E8F0', fontWeight: '600', marginBottom: 16, fontFamily: 'System' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  gridCard: { width: GRID_ITEM_WIDTH, height: GRID_ITEM_WIDTH, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 16, justifyContent: 'space-between' },
  gridIconContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { color: '#E2E8F0', fontSize: 14, fontWeight: '500' },
  contentCard: { height: 60, justifyContent: 'center' },
  contentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subPageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A', 
    zIndex: 10, 
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  subPagePlaceholderText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
});