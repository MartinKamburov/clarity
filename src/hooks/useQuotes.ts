import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Quote {
  id: string;
  content: string;
  author: string;
  vibe: string;
  tags: string[];
  categories: string[]; // This matches your DB Array type
  is_premium: boolean;
  score?: number; 
}

export const useQuotes = (userId: string | undefined, refreshSignal: number) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchSmartQuotes = async () => {
      try {
        setLoading(true);

        // 1. GET USER PROFILE
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('focus_areas, tone, manifestation_belief, is_premium, struggles') 
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          console.error('Profile fetch failed:', profileError); 
          return;
        }

        // --- DEBUGGING: Check what the DB is actually returning ---
        // console.log("User Profile Loaded:", {
        //   focus_areas: profile.focus_areas,
        //   belief: profile.manifestation_belief,
        //   struggles: profile.struggles
        // });

        // 2. CHECK FOR FOCUS AREAS
        // We removed the return statement here so the code continues 
        // even if focus_areas is empty or null.
        const focusAreas = profile.focus_areas || [];
        const hasFocusAreas = focusAreas.length > 0;

        // A. IF CATEGORY IS FAVORITES, RUN SIMPLE QUERY
        if (profile.focus_areas?.includes('favorites') || profile.focus_areas?.includes('Favorites')) {
          const { data } = await supabase
              .from('favorites')
              .select('quotes (*)')
              .eq('user_id', userId);
              
          const faves = data?.map((i: any) => i.quotes) || [];
          setQuotes(faves);
          setLoading(false);
          return; // STOP HERE, don't run the recommendation algo
        }

        const { data: favData } = await supabase
          .from('favorites')
          .select('quote_id')
          .eq('user_id', userId);
        
        // Create an array of IDs to exclude
        const excludedIds = favData?.map(f => f.quote_id) || [];

        // 3. QUERY: BROAD CANDIDATE POOL
        let query = supabase.from('quotes').select('*');

        // NEW: Exclude already favorited quotes if any exist
        if (excludedIds.length > 0) {
          query = query.not('id', 'in', `(${excludedIds.join(',')})`);
        }

        // If the user has specific areas, filter by them.
        // If they are on "General" (no areas), DO NOT call .overlaps() 
        // This will return all quotes, effectively creating a "General" mix.
        if (hasFocusAreas) {
          query = query.overlaps('categories', profile.focus_areas);
        }

        // Keep your other hard filters
        if (profile.manifestation_belief !== 'Yes') {
          query = query.eq('is_spiritual', false);
        }

        // C. Hard Filter: Premium
        if (!profile.is_premium) {
          query = query.eq('is_premium', false);
        }

        const { data: candidates, error: quoteError } = await query;

        if (quoteError) throw quoteError;

        if (candidates) {
          // 4. THE RECOMMENDATION ALGORITHM
          const rankedQuotes = candidates.map((quote) => {
            let score = 0;

            // --- CRITERIA 1: TONE MATCH (+15 Points) ---
            if (quote.vibe === profile.tone) score += 15;

            // --- CRITERIA 2: STRUGGLE MATCH (+15 Points) ---
            const struggleMatch = quote.tags?.some((tag: string) => 
                profile.struggles?.includes(tag)
            );
            if (struggleMatch) score += 15;

            // --- CRITERIA 3: FOCUS AREA DENSITY (+10 Points per match) ---
            // Safety: Ensure quote.categories exists before filtering
            if (profile.focus_areas && quote.categories) {
               const matchCount = quote.categories.filter((cat: string) => 
                 profile.focus_areas.includes(cat)
               ).length;
               score += (matchCount * 10);
            }

            // --- CRITERIA 4: RANDOM SHUFFLE (Tie-Breaker) ---
            score += Math.random(); 

            return { ...quote, score };
          });

          // 5. SORT BY HIGHEST SCORE
          rankedQuotes.sort((a, b) => (b.score || 0) - (a.score || 0));

          setQuotes(rankedQuotes);
        }

      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSmartQuotes();
  }, [userId, refreshSignal]);

  return { quotes, loading };
};