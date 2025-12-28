import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, LayoutChangeEvent, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { useQuotes } from '../../hooks/useQuotes';
import { supabase } from '../../lib/supabase';
import { createUserProfile } from '../../services/profileService';
import { User } from '@supabase/supabase-js';

// --- CUSTOM COMPONENTS ---
import { CircleButton } from '../../components/CircleButton';
import { PracticeButton } from '../../components/PracticeButton';
import { CategoriesSheet } from '../../components/sheets/CategoriesSheet';
import { ProfileSheet } from '../../components/sheets/ProfileSheet';
import { ThemeSheet } from '../../components/sheets/ThemeSheet';
import LoadingScreen from '../../components/LoadingScreen';

// --- DUMMY DATA ---
// const QUOTES = [
//   { id: '1', text: "I am enough.\nI did enough.\nI can let go." },
//   { id: '2', text: "Peace comes from within.\nDo not seek it without." },
//   { id: '3', text: "Seek peace even when\npeace doesn't seek you." },
// ];

export default function HomeScreen() {
  // Get Current User ID (You'll likely store this in a Context later)
  const [user, setUser] = useState<User | null>(null);
  // const [userId, setUserId] = useState<string | undefined>(undefined);
  // State for layout
  const [containerSize, setContainerSize] = useState<{ width: number, height: number } | null>(null);
  
  // Refs for Sheets
  const categoriesSheetRef = useRef<BottomSheet>(null);
  const profileSheetRef = useRef<BottomSheet>(null);
  const themeSheetRef = useRef<BottomSheet>(null);

  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        // console.log("Home screen loaded for:", user.id);
      }
    });
  }, []);
  // console.log("Here is the user: ", user);
  const { quotes, loading } = useQuotes(user?.id);

  // --- ACTIONS ---
  const handleOpenCategories = () => {
    categoriesSheetRef.current?.snapToIndex(2); 
  };

  const handleOpenProfile = () => {
    profileSheetRef.current?.snapToIndex(0);  //When you snap to an index you are snapping to one of these options and in profile sheet we only have: useMemo(() => ['90%'], []); so we can only snap to the 0th index
  };

  const handleChangeTheme = () => {
    themeSheetRef.current?.snapToIndex(1); 
  };

  if (!user) return <LoadingScreen/>;
  if (loading) return <LoadingScreen/>;

  // --- RENDERERS ---
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const renderQuoteItem = ({ item }: { item: typeof quotes[0] }) => {
    if (!containerSize) return null;
    return (
      <View style={{ width: containerSize.width, height: containerSize.height, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
        <Text style={styles.quoteText}>{item.content}</Text>
        <View style={styles.actionRow}>
           {/* Using the new reusable button here too! */}
           <CircleButton style={{ backgroundColor: 'transparent' }}>
              <Feather name="share" size={24} color="#1A2F5A" />
           </CircleButton>
           <CircleButton style={{ backgroundColor: 'transparent' }}>
              <Feather name="heart" size={24} color="#1A2F5A" />
           </CircleButton>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
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

      {/* 2. FLOATING UI */}
      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        
        {/* Top Bar */}
        <View style={styles.topBar}>
          <CircleButton onPress={handleOpenProfile}>
            <Feather name="user" size={24} color="#5A6B88" />
          </CircleButton>
          
          <CircleButton onPress={() => console.log("Subscribe")}>
            <MaterialCommunityIcons name="crown-outline" size={26} color="#5A6B88" />
          </CircleButton>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          {/* CATEGORIES */}
          <CircleButton onPress={handleOpenCategories}>
            <Feather name="grid" size={24} color="#5A6B88" />
          </CircleButton>

          {/* PRACTICE */}
          {/* <PracticeButton onPress={() => console.log("Start Practice")} /> */}

          {/* THEME */}
          <CircleButton onPress={handleChangeTheme}>
            <MaterialCommunityIcons name="format-paint" size={24} color="#5A6B88" />
          </CircleButton>
        </View>

      </SafeAreaView>

      {/* 3. SHEETS (Just drop them in here) */}
      <CategoriesSheet ref={categoriesSheetRef} />
      <ProfileSheet ref={profileSheetRef} /> 
      <ThemeSheet ref={themeSheetRef} /> 

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DCE6F5' },
  listContainer: { flex: 1 },
  overlayContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // Quote Specifics
  quoteText: { fontSize: 32, fontWeight: '600', color: '#1A2F5A', textAlign: 'center', lineHeight: 44, marginBottom: 40 },
  actionRow: { flexDirection: 'row', gap: 20 },
});