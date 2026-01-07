import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

// --- YOUR CUSTOM IMPORTS ---
import { useQuotes } from '../../hooks/useQuotes';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { addFavoriteQuote } from '../../services/addFavoriteQuote';
import { removeFavoriteQuote } from '../../services/removeFavoriteQuote';
import { CircleButton } from '../../components/CircleButton';
import { CategoriesSheet } from '../../components/sheets/CategoriesSheet';
import { ProfileSheet } from '../../components/sheets/ProfileSheet';
import { ThemeSheet } from '../../components/sheets/ThemeSheet';
import LoadingScreen from '../../components/LoadingScreen';

import { ImageBackground } from 'react-native'; // Import ImageBackground
import { useThemes } from '../../hooks/useThemes'; // Import the hook

// ==========================================================
// 1. NEW COMPONENT: QuoteSlide
// Handles the "Layers" to separate the screenshot from the buttons
// ==========================================================
const QuoteSlide = ({ 
  item, 
  size, 
  isFavorited, 
  onToggleFavorite,
  textColor // New Prop
}: { 
  item: any, 
  size: { width: number, height: number }, 
  isFavorited: boolean, 
  onToggleFavorite: () => void,
  textColor: string // New Prop Type
}) => {
  const viewShotRef = useRef<View>(null);

  const handleShare = async () => {
    try {
      // 1. Capture ONLY the Background Layer (viewShotRef)
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1.0, // High quality for the share sheet
      });
      
      // 2. Open the Share Sheet (This creates the view in your screenshot)
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Sharing failed", error);
    }
  };

  return (
    <View style={{ width: size.width, height: size.height }}>
      
      {/* LAYER A: THE SCREENSHOT (Background + Text) */}
      {/* This is what gets shared. It fills the screen but sits 'behind' the buttons */}
      <View 
        ref={viewShotRef} 
        collapsable={false} 
        style={[styles.slideCanvas, { width: size.width, height: size.height }]}
      >
        <View style={styles.textContainer}>
          {/* USE DYNAMIC TEXT COLOR HERE */}
          <Text style={[styles.quoteText, { color: textColor }]}>{item.content}</Text>
        </View>
      </View>

      {/* LAYER B: THE CONTROLS (Buttons) */}
      {/* Absolute positioned on top. NOT included in the screenshot ref */}
      <View style={styles.controlsLayer}>
        <View style={styles.actionRow}>
           <CircleButton style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} onPress={handleShare}>
              <Feather name="share" size={24} color="#1A2F5A" />
           </CircleButton>
           
           <CircleButton style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} onPress={onToggleFavorite}>
              <MotiView
                animate={{
                  scale: isFavorited ? [1, 1.5, 1] : 1,
                  rotate: isFavorited ? ['0deg', '15deg', '-15deg', '0deg'] : '0deg',
                }}
                transition={{ type: 'spring', duration: 400 }}
              >
                <MaterialCommunityIcons 
                  name={isFavorited ? "heart" : "heart-outline"} 
                  size={26} 
                  color={isFavorited ? "#000000" : "#1A2F5A"}  
                />
              </MotiView>
           </CircleButton>
        </View>
      </View>

    </View>
  );
};

// ==========================================================
// MAIN HOME SCREEN
// ==========================================================
export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number, height: number } | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const { quotes, loading } = useQuotes(user?.id, refreshSignal);
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  const { themes, activeTheme, selectTheme, loading: themesLoading } = useThemes(user?.id);

  // Refs for Sheets
  const categoriesSheetRef = useRef<BottomSheet>(null);
  const profileSheetRef = useRef<BottomSheet>(null);
  const themeSheetRef = useRef<BottomSheet>(null);
  
  // --- EFFECTS ---
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  }, []);

  // Sync Favorites on Load
  useEffect(() => {
    if (!user?.id) return;
    const syncInitialFavorites = async () => {
      const { data } = await supabase.from('favorites').select('quote_id').eq('user_id', user.id);
      if (data) setLocalFavorites(data.map((fav) => fav.quote_id));
    };
    syncInitialFavorites();
  }, [user?.id]);

  // --- ACTIONS ---
  const handleOpenCategories = () => categoriesSheetRef.current?.snapToIndex(2); 
  const handleOpenProfile = () => profileSheetRef.current?.snapToIndex(0);
  const handleChangeTheme = () => themeSheetRef.current?.snapToIndex(1); 

  // Toggle Logic (Passed down to QuoteSlide)
  const handleToggleFavorite = async (item: typeof quotes[0]) => {
    const isCurrentlyFavorited = localFavorites.includes(item.id);
    
    if (isCurrentlyFavorited) {
      Haptics.selectionAsync();
      setLocalFavorites(prev => prev.filter(id => id !== item.id));
      await removeFavoriteQuote(item, user!.id);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLocalFavorites(prev => [...prev, item.id]);
      await addFavoriteQuote(item, user!.id);
    }
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  // --- RENDERER ---
  const renderQuoteItem = ({ item }: { item: typeof quotes[0] }) => {
    if (!containerSize) return null;
    return (
      <QuoteSlide 
        item={item}
        size={containerSize}
        isFavorited={localFavorites.includes(item.id)}
        onToggleFavorite={() => handleToggleFavorite(item)}
        // 2. PASS THEME COLOR TO SLIDE
        textColor={activeTheme?.text_color_hex || '#FFFFFF'} 
      />
    );
  };

  if (!user || loading) return <LoadingScreen/>;

  return (
    <View style={styles.container}>
      
      <ImageBackground 
            source={activeTheme ? { uri: activeTheme.background_image_url } : undefined}
            style={{ flex: 1, backgroundColor: activeTheme ? undefined : '#DCE6F5' }}
            resizeMode="cover"
        >
        {/* 1. MAIN LIST */}
        <View style={styles.listContainer} onLayout={onLayout}>
            {containerSize && (
            <FlatList
                data={quotes}
                renderItem={renderQuoteItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                snapToAlignment="start"
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                getItemLayout={(data, index) => ({ length: containerSize.height, offset: containerSize.height * index, index })}
            />
            )}
        </View>

        {/* 2. FLOATING UI (Global Navigation) */}
        <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
          <View style={styles.topBar}>
            <CircleButton onPress={handleOpenProfile}>
              <Feather name="user" size={24} color="#5A6B88" />
            </CircleButton>
            <CircleButton onPress={() => console.log("Subscribe")}>
              <MaterialCommunityIcons name="crown-outline" size={26} color="#5A6B88" />
            </CircleButton>
          </View>

          <View style={styles.bottomBar}>
            <CircleButton onPress={handleOpenCategories}>
              <Feather name="grid" size={24} color="#5A6B88" />
            </CircleButton>
            <CircleButton onPress={handleChangeTheme}>
              <MaterialCommunityIcons name="format-paint" size={24} color="#5A6B88" />
            </CircleButton>
          </View>
        </SafeAreaView>

        <CategoriesSheet ref={categoriesSheetRef} user={user} onUpdate={() => setRefreshSignal(prev => prev + 1)} />
        <ProfileSheet ref={profileSheetRef} /> 
        <ThemeSheet 
            ref={themeSheetRef} 
            themes={themes}
            activeTheme={activeTheme}
            onSelectTheme={selectTheme}
            isLoading={themesLoading}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DCE6F5' },
  listContainer: { flex: 1 },
  
  // --- SLIDE STYLES (Fixes Overlap) ---
  slideCanvas: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30, 
  },
  textContainer: {
    // This padding ensures the text never goes behind the buttons at the bottom
    paddingBottom: 150, 
    width: '100%',
    alignItems: 'center',
  },
  quoteText: { 
    fontSize: 32, 
    fontWeight: '600', 
    color: '#1A2F5A', 
    textAlign: 'center', 
    lineHeight: 44 
  },
  
  // --- CONTROLS LAYER (Floating) ---
  controlsLayer: {
    position: 'absolute',
    bottom: 140, // Fixed distance from bottom
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensures buttons are clickable
  },
  actionRow: { 
    flexDirection: 'row', 
    gap: 30 
  },

  
  // --- GLOBAL OVERLAY ---
  overlayContainer: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingBottom: 20 
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});