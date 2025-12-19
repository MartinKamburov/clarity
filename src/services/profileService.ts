import { supabase } from '../lib/supabase';

// 1. Define the interface to match ALL the data collected across screens
interface OnboardingData {
  // Screen 8 Data
  name: string;
  focus: string | string[];    // Can come as string "A,B" or array ["A","B"]
  struggle: string | string[]; // Can come as string "A,B" or array ["A","B"]
  tone: string;
  manifestation: string;       // Mapped to 'manifestation_belief'
  
  // Screen 10 Data (Notifications)
  notification_freq: number;
  notification_start: string;
  notification_end: string;

  // Screen 11 Data (Theme)
  theme: string;               // Mapped to 'selected_theme_id' (UUID)
}

export const createUserProfile = async (data: OnboardingData) => {
  try {
    // 1. Get Current User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("No authenticated user found.");
      return { success: false, error: "No user found" };
    }

    // 2. Helper to ensure arrays are formatted correctly (handles Expo Router stringifying arrays)
    const parseArray = (input: string | string[]) => {
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') return input.split(',');
      return [];
    };

    // 3. Upsert into Supabase
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        
        // --- SCREEN 8 MAPPINGS ---
        full_name: data.name,
        focus_areas: parseArray(data.focus),
        struggles: parseArray(data.struggle),
        tone: data.tone,
        manifestation_belief: data.manifestation,

        // --- SCREEN 10 MAPPINGS ---
        notification_freq: Number(data.notification_freq), // Ensure it's a number
        notification_start: data.notification_start,
        notification_end: data.notification_end,

        // --- SCREEN 11 MAPPINGS ---
        selected_theme_id: data.theme, // Maps 'theme' param to 'selected_theme_id' column

        // --- DEFAULTS ---
        is_premium: false,
        notification_time: '09:00', // Default fallback for the 'time' column
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Supabase Error:", insertError); // Helpful for debugging UUID issues
      throw insertError;
    }

    return { success: true };

  } catch (error) {
    console.error("Error creating profile:", error);
    return { success: false, error };
  }
};