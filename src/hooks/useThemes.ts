// hooks/useThemes.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Theme {
  id: string;
  name: string;
  background_image_url: string;
  text_color_hex: string;
  is_premium: boolean;
  category?: string; // Optional: Add 'category' column to DB if you want filters to work effectively
}

export const useThemes = (userId: string | undefined) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Themes & Current User Selection
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // A. Get All Themes
        const { data: themesData, error: themesError } = await supabase
          .from('themes')
          .select('*')
          .order('is_premium', { ascending: true }); // Free themes first

        if (themesError) throw themesError;
        setThemes(themesData || []);

        // B. Get User's Selected Theme ID
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('selected_theme_id')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // C. Set Active Theme
        if (profileData?.selected_theme_id && themesData) {
          const current = themesData.find(t => t.id === profileData.selected_theme_id);
          if (current) setActiveTheme(current);
        } else if (themesData && themesData.length > 0) {
           // Fallback to first theme if none selected
           setActiveTheme(themesData[0]); 
        }

      } catch (error) {
        console.error('Error fetching themes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // 2. Function to Change Theme
  const selectTheme = async (theme: Theme) => {
    if (!userId) return;

    // Optimistic Update (Instant UI change)
    setActiveTheme(theme);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ selected_theme_id: theme.id })
        .eq('id', userId);

      if (error) {
        console.error("Failed to save theme:", error);
        // Optional: Revert state here if critical
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { themes, activeTheme, selectTheme, loading };
};