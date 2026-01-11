import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Hooks & Services
import { fetchFavoriteQuotes } from '../../hooks/fetchFavoriteQuotes';
import { removeFavoriteQuote } from '../../services/removeFavoriteQuote';

interface FavoritesListProps {
  userId?: string;
}

export const FavoritesList = ({ userId }: FavoritesListProps) => {
  // We use a local refresh signal to reload the list after deletion
  const [refreshSignal, setRefreshSignal] = useState(0);
  
  // Use the hook
  const { quotes, loading } = fetchFavoriteQuotes(userId, refreshSignal);

  // --- HANDLERS ---
  const handleRemove = async (quote: any) => {
    if (!userId) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 1. Remove from DB
    await removeFavoriteQuote(quote, userId);
    
    // 2. Trigger re-fetch
    setRefreshSignal(prev => prev + 1);
  };

  const handleShare = async (text: string) => {
    Haptics.selectionAsync();
    try {
        await Share.share({
            message: `"${text}"`, // Simple text share
        });
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
    <FlatList
      data={quotes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.favCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.favText}>"{item.content}"</Text>
          </View>
          
          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
              
              {/* SHARE BUTTON */}
              <TouchableOpacity 
                onPress={() => handleShare(item.content)} 
                style={styles.iconButton}
                hitSlop={10}
              >
                <Feather name="share" size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* DELETE BUTTON */}
              <TouchableOpacity 
                onPress={() => handleRemove(item)} 
                style={styles.iconButton}
                hitSlop={10}
              >
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  emptyText: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  favCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  favText: {
    color: '#F1F5F9',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'normal',
  },
  
  // NEW STYLES
  actionRow: {
      flexDirection: 'row',
      gap: 8,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});