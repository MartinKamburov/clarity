import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'; 
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Import Insets

const PAGE_SIZE = 15;

interface HistoryListProps {
  userId?: string;
}

export const HistoryList = ({ userId }: HistoryListProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const insets = useSafeAreaInsets(); // 2. Get Insets

  const fetchHistory = useCallback(async (startFrom = 0) => {
    // 3. FIX: Handle missing userId gracefully so loading state turns off
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const from = startFrom;
      const to = startFrom + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('quote_history')
        .select(`
          last_seen_at,
          quotes ( id, content, author )
        `)
        .eq('user_id', userId)
        .order('last_seen_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const validData = (data || []).filter((item: any) => item.quotes !== null);

      if (validData.length < PAGE_SIZE) setHasMore(false);

      if (startFrom === 0) setHistory(validData);
      else setHistory(prev => [...prev, ...validData]);
      
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  const handleShare = async (text: string) => {
    Haptics.selectionAsync();
    try { await Share.share({ message: `"${text}"` }); } catch (error) { console.error(error); }
  };

  if (loading && history.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (!loading && history.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="history" size={48} color="rgba(255,255,255,0.2)" />
        <Text style={styles.emptyText}>No history yet.</Text>
      </View>
    );
  }

  return (
    <BottomSheetFlatList
      data={history}
      keyExtractor={(_: any, index: number) => index.toString()}
      style={{ flex: 1 }} // 4. FIX: Force full height
      contentContainerStyle={{ 
        padding: 24, 
        paddingBottom: insets.bottom + 100, // 5. FIX: Dynamic bottom padding
        flexGrow: 1 // 6. FIX: Ensure container stretches
      }}
      showsVerticalScrollIndicator={false}
      onEndReached={() => !fetchingMore && hasMore && !loading && fetchHistory(history.length)}
      onEndReachedThreshold={0.5}
      renderItem={({ item, index }: { item: any, index: number }) => {
        const quote = item.quotes;
        return (
          <Animated.View 
            entering={FadeInDown.delay(index % 15 * 50).springify()} 
            style={styles.historyCard}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.quoteText}>"{quote.content}"</Text>
              <Text style={styles.timestamp}>
                  Seen {formatDistanceToNow(new Date(item.last_seen_at), { addSuffix: true })}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleShare(quote.content)} style={styles.iconButton} hitSlop={10}>
              <Feather name="share" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </Animated.View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 200 },
  emptyText: { color: '#E2E8F0', fontSize: 18, fontWeight: '600' },
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  quoteText: { color: '#F1F5F9', fontSize: 15, lineHeight: 22, fontWeight: '500' },
  timestamp: { color: '#64748B', fontSize: 12, marginTop: 8 },
  iconButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});