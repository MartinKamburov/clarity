import React, { useMemo, useCallback, forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; // Added Icon for premium lock
import * as Haptics from 'expo-haptics';
import { Theme } from '../../hooks/useThemes'; // Import the interface

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48 - 12) / 2; 

const THEME_FILTERS = ['All', 'Premium', 'Free']; // Simplified filters based on DB data

interface ThemeSheetProps {
  themes: Theme[];
  activeTheme: Theme | null;
  onSelectTheme: (theme: Theme) => void;
  isLoading: boolean;
}

export const ThemeSheet = forwardRef<BottomSheet, ThemeSheetProps>(({ themes, activeTheme, onSelectTheme, isLoading }, ref) => {
  const snapPoints = useMemo(() => ['1%', '50%', '90%'], []);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handlePress = () => Haptics.selectionAsync();

  const handleClose = () => {
    // @ts-ignore
    ref?.current?.close();
  };

  // Filter Logic
  const filteredThemes = useMemo(() => {
    if (selectedFilter === 'All') return themes;
    if (selectedFilter === 'Premium') return themes.filter(t => t.is_premium);
    if (selectedFilter === 'Free') return themes.filter(t => !t.is_premium);
    return themes;
  }, [selectedFilter, themes]);

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

      {isLoading ? (
        <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color="#FFF" />
        </View>
      ) : (
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* --- FILTERS --- */}
            <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
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

            {/* --- GRID --- */}
            <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>For you</Text>
            </View>
            
            <View style={styles.gridContainer}>
            {filteredThemes.length > 0 ? (
                filteredThemes.map((theme) => (
                <ThemeCard 
                    key={theme.id} 
                    theme={theme} 
                    isActive={activeTheme?.id === theme.id}
                    onPress={() => {
                        handlePress();
                        onSelectTheme(theme);
                    }} 
                />
                ))
            ) : (
                <Text style={styles.emptyText}>No themes found.</Text>
            )}
            </View>

        </BottomSheetScrollView>
      )}
    </BottomSheet>
  );
});

// --- SUB-COMPONENT: CARD ---
const ThemeCard = ({ theme, onPress, isActive }: { theme: Theme, onPress: () => void, isActive: boolean }) => (
    <TouchableOpacity 
      style={[styles.themeCard, isActive && styles.activeCardBorder]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <Image source={{ uri: theme.background_image_url }} style={styles.themeImage} resizeMode="cover" />
      
      {/* Dark Overlay for Text Readability */}
      <View style={styles.themeOverlay}>
        {isActive && (
             <View style={styles.checkIcon}>
                 <Feather name="check" size={14} color="#0F172A" />
             </View>
        )}
        
        <Text style={styles.themeTitle} numberOfLines={1}>{theme.name}</Text>
        
        {theme.is_premium && (
            <View style={styles.lockBadge}>
                 <MaterialCommunityIcons name="crown" size={12} color="#FFD700" />
            </View>
        )}
      </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  // ... (Keep existing styles from your provided code) ...
  // Add these for the new active/lock states:
  activeCardBorder: {
      borderWidth: 2,
      borderColor: '#38BDF8', // Light blue selection border
  },
  checkIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: '#38BDF8',
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
  },
  lockBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },

  // (Paste rest of your styles here exactly as they were)
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
  scrollContent: {
    paddingBottom: 50,
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  filterScrollView: {
    gap: 8,
    paddingHorizontal: 24, 
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
  themeCard: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
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