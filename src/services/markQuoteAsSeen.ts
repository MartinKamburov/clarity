import { supabase } from '../lib/supabase';

export const markQuoteAsSeen = async (quoteId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('quote_history')
      .upsert(
        { 
          user_id: userId, 
          quote_id: quoteId, 
          last_seen_at: new Date().toISOString() 
        },
        { onConflict: 'user_id, quote_id' }
      );

    if (error) throw error;
  } catch (err) {
    console.error('Error marking quote as seen:', err);
  }
};