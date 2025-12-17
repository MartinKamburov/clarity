import React, { useMemo, useCallback, forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48 - 12) / 2; // 2 columns with spacing

const THEME_FILTERS = ['All', 'New', 'Seasonal', 'Most popular', 'Nature'];

const THEMES = [
  { id: '1', title: 'Abstract Blue Waves', image: require('../../../assets/AbstractBlueWaves.png') },
  { id: '2', title: 'Frosted Glass', image: require('../../../assets/FrostedGlass.png') },
  { id: '3', title: 'Mountain/Lake View', image: require('../../../assets/MountainLake.png')},
];

export const ThemeSheet = forwardRef<BottomSheet>((props, ref) => {
  const snapPoints = useMemo(() => ['90%'], []);
  const [selectedFilter, setSelectedFilter] = useState('All');

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
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#0F172A' }} // Premium Dark Blue
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
        
        {/* --- FILTERS --- */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handlePress}>
            <Feather name="plus" size={18} color="#E2E8F0" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
            {THEME_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                onPress={() => { handlePress(); setSelectedFilter(filter); }}
              >
                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- THEME MIXES (Example Section) --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Theme mixes</Text>
          <TouchableOpacity onPress={handlePress}><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalThemes}>
            {THEMES.slice(0, 2).map((theme) => (
                <ThemeCard key={theme.id} theme={theme} onPress={handlePress} isHorizontal />
            ))}
        </ScrollView>


        {/* --- FOR YOU GRID --- */}
        <Text style={styles.sectionTitle}>For you</Text>
        <View style={styles.gridContainer}>
          {THEMES.slice(2).map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onPress={handlePress} />
          ))}
        </View>

      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const ThemeCard = ({ theme, onPress, isHorizontal }: { theme: any, onPress: () => void, isHorizontal?: boolean }) => (
    <TouchableOpacity style={[styles.themeCard, isHorizontal && styles.horizontalThemeCard]} onPress={onPress} activeOpacity={0.9}>
      <Image source={theme.image} style={styles.themeImage} resizeMode="cover" />
      <View style={styles.themeOverlay}>
        {theme.isVideo && <MaterialCommunityIcons name="play-circle-outline" size={24} color="#FFF" style={styles.videoIcon} />}
        {theme.isFree && <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>Free</Text></View>}
        <Text style={styles.themeTitle}>{theme.title}</Text>
        {theme.isEditable && <View style={styles.editBadge}><Text style={styles.editBadgeText}>Edit</Text></View>}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  createButtonText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  filterScrollView: {
    gap: 8,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterChipActive: {
    backgroundColor: '#E2E8F0',
  },
  filterText: {
    color: '#E2E8F0',
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
    paddingHorizontal: 24,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7FAFC',
  },
  seeAllText: {
    color: '#E2E8F0',
    fontWeight: '600',
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

  // Theme Card
  themeCard: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
    position: 'absolute',
  },
  videoIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  freeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  freeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  editBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  }
});