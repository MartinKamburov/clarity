import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
// Use FlatList from Gesture Handler for best scrolling in Sheet
import { FlatList } from 'react-native-gesture-handler'; 
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  FadeInDown,
} from 'react-native-reanimated';

const PAGE_SIZE = 15;

interface Quote {
  id: string;
  content: string;
  author?: string;
}

interface HistoryItem {
  last_seen_at: string;
  quotes: Quote;
}

const SkeletonItem = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.historyCard, animatedStyle, { height: 90, justifyContent: 'center' }]}>
      <View style={{ gap: 10, flex: 1 }}>
        <View style={{ height: 16, width: '80%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
        <View style={{ height: 16, width: '50%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
        <View style={{ height: 12, width: '30%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginTop: 4 }} />
      </View>
    </Animated.View>
  );
};

interface HistoryListProps {
  userId?: string;
}

export const HistoryList = ({ userId }: HistoryListProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(async (startFrom = 0) => {
    if (!userId) return;

    try {
      const from = startFrom;
      const to = startFrom + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('quote_history')
        .select(`
          last_seen_at,
          quotes (
            id,
            content,
            author
          )
        `)
        .eq('user_id', userId)
        .order('last_seen_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const validData = (data || [])
        .filter((item: any) => item.quotes !== null) as unknown as HistoryItem[];

      if (validData.length < PAGE_SIZE) {
        setHasMore(false);
      }

      if (startFrom === 0) {
        setHistory(validData);
      } else {
        setHistory(prev => [...prev, ...validData]);
      }
      
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

  const handleLoadMore = () => {
    if (!fetchingMore && hasMore && !loading) {
      setFetchingMore(true);
      fetchHistory(history.length);
    }
  };

  const handleShare = async (text: string) => {
    Haptics.selectionAsync();
    try {
        await Share.share({ message: `"${text}"` });
    } catch (error) {
        console.error(error);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons name="history" size={48} color="rgba(255,255,255,0.2)" />
      <Text style={styles.emptyText}>No history yet.</Text>
      <Text style={styles.emptySubText}>Quotes you view on the home screen will appear here.</Text>
    </View>
  );

  const renderFooter = () => {
    if (!fetchingMore) return <View style={{ height: 40 }} />;
    return (
      <View style={{ height: 60, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#94A3B8" />
      </View>
    );
  };

  return (
    <FlatList
      data={loading ? Array(6).fill({}) : history}
      keyExtractor={(_: any, index: number) => index.toString()}
      style={{ flex: 1 }}
      // Padding bottom 120 is plenty now because we fixed the ProfileSheet layout
      contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={!loading ? renderEmptyState : null}
      renderItem={({ item, index }: { item: any, index: number }) => {
        if (loading) return <SkeletonItem />;

        const historyItem = item as HistoryItem;
        const quote = historyItem.quotes;
        
        return (
          <Animated.View 
            entering={FadeInDown.delay(index % 15 * 50).springify()} 
            style={styles.historyCard}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.quoteText}>"{quote.content}"</Text>
              <Text style={styles.timestamp}>
                  Seen {formatDistanceToNow(new Date(historyItem.last_seen_at), { addSuffix: true })}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleShare(quote.content)} 
              style={styles.iconButton}
              hitSlop={10}
            >
              <Feather name="share" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </Animated.View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 200, 
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
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  quoteText: {
    color: '#F1F5F9',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  timestamp: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});