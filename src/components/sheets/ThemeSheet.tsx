import React, { useMemo, useCallback, forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48 - 12) / 2; 

const THEME_FILTERS = ['All', 'New', 'Seasonal', 'Most popular', 'Nature'];

const FEATURED_THEMES = [
  { id: '1', title: 'Abstract Blue Waves', image: require('../../../assets/AbstractBlueWaves.png'), category: 'New' },
  { id: '2', title: 'Frosted Glass', image: require('../../../assets/FrostedGlass.png'), category: 'Most popular' },
];

const ALL_THEMES = [
  { id: '1', title: 'Abstract Blue Waves', image: require('../../../assets/AbstractBlueWaves.png'), category: 'New' },
  { id: '2', title: 'Frosted Glass', image: require('../../../assets/FrostedGlass.png'), category: 'Most popular' },
  { id: '3', title: 'Mountain View', image: require('../../../assets/MountainLake.png'), category: 'Nature'},
  { id: '4', title: 'Deep Ocean', image: require('../../../assets/AbstractBlueWaves.png'), category: 'Nature' },
  { id: '5', title: 'Winter Mist', image: require('../../../assets/FrostedGlass.png'), category: 'Seasonal' },
  { id: '6', title: 'Night Sky', image: require('../../../assets/MountainLake.png'), category: 'New' },
];

export const ThemeSheet = forwardRef<BottomSheet>((props, ref) => {
  const snapPoints = useMemo(() => ['1%', '50%', '90%'], []);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handlePress = () => Haptics.selectionAsync();

  const handleClose = () => {
    // @ts-ignore
    ref?.current?.close();
  };

  const filteredThemes = useMemo(() => {
    if (selectedFilter === 'All') return ALL_THEMES;
    return ALL_THEMES.filter(theme => theme.category === selectedFilter);
  }, [selectedFilter]);

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
      handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 40 }}
    >
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
          <Feather name="x" size={22} color="#E2E8F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Themes</Text>
        <TouchableOpacity style={styles.unlockButton} onPress={handlePress}>
          <Text style={styles.unlockButtonText}>Unlock all</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- SCROLLABLE FILTERS (Including Create Button) --- */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterScrollView}
          >
            {/* 1. Create Button (Now part of the scroll) */}
            <TouchableOpacity style={styles.createButton} onPress={handlePress}>
                <Feather name="plus" size={18} color="#E2E8F0" />
                <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>

            {/* 2. Filter Tags */}
            {THEME_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip, 
                  selectedFilter === filter && styles.filterChipActive
                ]}
                onPress={() => { 
                  handlePress(); 
                  setSelectedFilter(filter); 
                }}
              >
                <Text style={[
                  styles.filterText, 
                  selectedFilter === filter && styles.filterTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- SECTION 1: THEME MIXES --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Theme mixes</Text>
          <TouchableOpacity onPress={handlePress}><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalThemes}>
            {FEATURED_THEMES.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} onPress={handlePress} isHorizontal />
            ))}
        </ScrollView>


        {/* --- SECTION 2: FOR YOU --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>For you</Text>
        </View>
        
        <View style={styles.gridContainer}>
          {filteredThemes.length > 0 ? (
            filteredThemes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} onPress={handlePress} />
            ))
          ) : (
            <Text style={styles.emptyText}>No themes found for {selectedFilter}</Text>
          )}
        </View>

      </BottomSheetScrollView>
    </BottomSheet>
  );
});

// --- SUB-COMPONENT: CARD ---
const ThemeCard = ({ theme, onPress, isHorizontal }: { theme: any, onPress: () => void, isHorizontal?: boolean }) => (
    <TouchableOpacity 
      style={[styles.themeCard, isHorizontal && styles.horizontalThemeCard]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <Image source={theme.image} style={styles.themeImage} resizeMode="cover" />
      <View style={styles.themeOverlay}>
        <Text style={styles.themeTitle}>{theme.title}</Text>
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
  unlockButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  unlockButtonText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 12,
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 50,
  },

  // Filters
  filtersContainer: {
    paddingVertical: 16,
  },
  filterScrollView: {
    gap: 8,
    paddingHorizontal: 24, // Padding applied to the SCROLL CONTENT, not the container
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginRight: 8, // Extra spacing between Create and first filter
  },
  createButtonText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: '#E2E8F0',
    borderColor: '#E2E8F0',
  },
  filterText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0F172A',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24, // Consistent 24px padding for all headers
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7FAFC',
    // Removed paddingHorizontal from here to avoid double padding
  },
  seeAllText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  horizontalThemes: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 20,
    width: '100%',
    textAlign: 'center',
  },

  // Theme Card
  themeCard: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  horizontalThemeCard: {
      width: GRID_ITEM_WIDTH * 1.2,
      height: GRID_ITEM_WIDTH * 0.8,
  },
  themeImage: {
    width: '100%',
    height: '100%',
  },
  themeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  themeTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});