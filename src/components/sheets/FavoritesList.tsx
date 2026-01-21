import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Import Insets

// Hooks & Services
import { fetchFavoriteQuotes } from '../../hooks/fetchFavoriteQuotes';
import { removeFavoriteQuote } from '../../services/removeFavoriteQuote';

interface FavoritesListProps {
  userId?: string;
}

export const FavoritesList = ({ userId }: FavoritesListProps) => {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const insets = useSafeAreaInsets(); // 2. Initialize Insets
  
  const { quotes, loading } = fetchFavoriteQuotes(userId, refreshSignal);

  const handleRemove = async (quote: any) => {
    if (!userId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await removeFavoriteQuote(quote, userId);
    setRefreshSignal(prev => prev + 1);
  };

  const handleShare = async (text: string) => {
    Haptics.selectionAsync();
    try {
        await Share.share({ message: `"${text}"` });
    } catch (error) {
        console.error("Error sharing quote:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="heart-broken" size={48} color="rgba(255,255,255,0.2)" />
        <Text style={styles.emptyText}>No favorites yet.</Text>
        <Text style={styles.emptySubText}>Save quotes you love to see them here.</Text>
      </View>
    );
  }

  return (
    <BottomSheetFlatList
      data={quotes}
      keyExtractor={(item: any) => item.id}
      style={{ flex: 1 }} // 3. Force full height
      contentContainerStyle={{ 
        padding: 24, 
        flexGrow: 1, // 4. Ensure container fills space
        paddingBottom: insets.bottom + 100 // 5. Dynamic bottom padding
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }: { item: any }) => (
        <View style={styles.favCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.favText}>"{item.content}"</Text>
          </View>
          
          <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => handleShare(item.content)} style={styles.iconButton} hitSlop={10}>
                <Feather name="share" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleRemove(item)} style={styles.iconButton} hitSlop={10}>
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  emptyText: { color: '#E2E8F0', fontSize: 18, fontWeight: '600' },
  emptySubText: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 4 },
  favCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  favText: { color: '#F1F5F9', fontSize: 16, lineHeight: 24 },
  actionRow: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});