import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

// --- DUMMY DATA ---
const QUOTES = [
  { id: '1', text: "I am enough.\nI did enough.\nI can let go." },
  { id: '2', text: "Peace comes from within.\nDo not seek it without." },
  { id: '3', text: "This too shall pass.\nYou are stronger than you know." },
  { id: '4', text: "Focus on the step in front of you,\nnot the whole staircase." },
  { id: '5', text: "You don't have to control your thoughts.\nYou just have to stop letting them control you." },
];

export default function HomeScreen() {
  const router = useRouter();
  
  // 1. STATE TO HOLD EXACT HEIGHT
  const [containerSize, setContainerSize] = useState<{ width: number, height: number } | null>(null);

  const handlePress = () => {
    Haptics.selectionAsync();
  };

  // 2. CAPTURE THE AVAILABLE SPACE
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  // 3. RENDER ITEM (Uses calculated height)
  const renderQuoteItem = ({ item }: { item: typeof QUOTES[0] }) => {
    if (!containerSize) return null; // Don't render until we know the size

    return (
      <View style={{ 
          width: containerSize.width, 
          height: containerSize.height, // <--- THE KEY FIX
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 30,
        }}>
        
        {/* Quote Content */}
        <Text style={styles.quoteText}>
          {item.text}
        </Text>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handlePress} style={styles.actionIcon}>
              <Feather name="share" size={24} color="#1A2F5A" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePress} style={styles.actionIcon}>
              <Feather name="heart" size={24} color="#1A2F5A" />
          </TouchableOpacity>
        </View>

      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* --- BACKGROUND LIST CONTAINER --- */}
      {/* We measure this view to see exactly how much space we have */}
      <View style={styles.listContainer} onLayout={onLayout}>
        {containerSize && (
          <FlatList
            data={QUOTES}
            renderItem={renderQuoteItem}
            keyExtractor={(item) => item.id}
            
            // PHYSICS
            pagingEnabled
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            
            // OPTIMIZATION (Now accurate because we use containerSize)
            getItemLayout={(data, index) => ({
              length: containerSize.height,
              offset: containerSize.height * index,
              index,
            })}
          />
        )}
      </View>

      {/* --- FOREGROUND UI (Floating) --- */}
      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={handlePress}>
            <Feather name="user" size={24} color="#5A6B88" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={handlePress}>
            <MaterialCommunityIcons name="crown-outline" size={26} color="#5A6B88" />
          </TouchableOpacity>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.circleButton} onPress={handlePress}>
            <Feather name="grid" size={24} color="#5A6B88" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.practiceButton} onPress={handlePress}>
            <MaterialCommunityIcons name="meditation" size={20} color="#FFFFFF" />
            <Text style={styles.practiceText}>Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.circleButton} onPress={handlePress}>
            <MaterialCommunityIcons name="format-paint" size={24} color="#5A6B88" />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DCE6F5', 
  },
  listContainer: {
    flex: 1, // Fills all available space (excluding any system tab bars)
  },
  
  // --- TEXT STYLES ---
  quoteText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1A2F5A',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 40,
  },
  actionIcon: {
    padding: 10,
  },

  // --- OVERLAY ---
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  
  // --- UI ELEMENTS ---
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 47, 90, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7C93',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  practiceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});