import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// 1. Define the shape of the Quote data you want to display
export interface Quote {
  id: string;
  content: string;
  author: string;
  vibe: string;
  categories: string[];
  is_premium: boolean;
}

// 2. Rename to 'use...' because it uses hooks
export const fetchFavoriteQuotes = (userId: string | undefined, refreshSignal: number = 0) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);

        // 3. THE QUERY
        // We select 'quotes (*)' which tells Supabase to follow the foreign key 
        // and fetch the actual quote data for every favorite entry.
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            id,
            created_at,
            quotes (*)  
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false }); // Show newest favorites first

        if (error) {
          throw error;
        }

        if (data) {
          // 4. DATA TRANSFORMATION
          // Supabase returns an array like: [{ quotes: { content: "...", ... } }, ...]
          // We map over it to extract just the 'quotes' object so it fits your UI.
          const formattedQuotes = data
            .map((item: any) => item.quotes) // Extract the nested quote
            .filter((item) => item !== null); // Safety check in case a quote was deleted

          setQuotes(formattedQuotes);
        }

      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId, refreshSignal]); // Re-run if user changes or signal updates

  return { quotes, loading };
};