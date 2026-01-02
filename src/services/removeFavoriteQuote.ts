import { supabase } from '../lib/supabase';
import { Quote } from '../hooks/useQuotes';

export const removeFavoriteQuote = async (quote: Quote, profileId: string) => {
    try {
        // Use .delete() to remove the row matching both IDs
        const { data, error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', profileId)
            .eq('quote_id', quote.id)
            .select(); // .select() allows you to see what was deleted

        if (error) {
            console.error('Error removing favorite quote:', error.message);
            return null;
        }

        // data will be an array of the deleted items
        if (data && data.length > 0) {
            console.log("Favorite quote removed successfully:", data);
            return data;
        } else {
            console.log("No favorite found to remove.");
            return null;
        }

    } catch (err) {
        console.error('Unexpected error during removal:', err);
        return null;
    }
};