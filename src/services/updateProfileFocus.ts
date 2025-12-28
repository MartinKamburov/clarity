import { supabase } from '../lib/supabase';

export const updateProfileFocus = async (focus: string | string[]) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("No authenticated user found.");
      return { success: false, error: "No user found" };
    }

    // 2. Format the input with "General" awareness
    const formatFocus = (input: string | string[]) => {
      // If the user clicked "General", return an empty array
      // This triggers the 'All Quotes' or 'Fallback' logic in your hook
      if (input === 'General' || input === 'general' || input === '') {
        return [];
      }
      
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') return [input]; 
      return [];
    };

    // 3. Update the column
    const { error } = await supabase
      .from('profiles')
      .update({ 
        focus_areas: formatFocus(focus),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating profile focus:", error);
    return { success: false, error };
  }
};