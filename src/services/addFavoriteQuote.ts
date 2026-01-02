import { supabase } from '../lib/supabase';
import { Quote } from '../hooks/useQuotes';

export const addFavoriteQuote = async (quote: Quote, profileId: string) => {
    // 1. CHECK: See if this user has already favorited this quote
    const { data: existingFavorite, error: checkError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', profileId)
        .eq('quote_id', quote.id)
        .maybeSingle(); // Returns the object if found, or null if not found

    // Handle unexpected errors during the check
    if (checkError) {
        console.error('Error checking existing favorites:', checkError.message);
        return null;
    }

    // 2. VERIFY: If it exists, exit early
    if (existingFavorite) {
        console.log("This quote is already in your favorites.");
        return null; // Or return existingFavorite if you prefer
    }

    // 3. INSERT: If it doesn't exist, proceed with the insert
    const { data, error } = await supabase
    .from('favorites')
    .insert([
      {
        user_id: profileId,
        quote_id: quote.id,
      },
    ])
    .select();

    if (error) {
        console.error('Error adding favorite quote:', error.message);
        return null;
    }

    console.log("Favourite quote added succesfully: ", data);
    return data;
};