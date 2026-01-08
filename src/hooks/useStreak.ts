import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';

export const useStreak = (userId: string | undefined) => {
  const [streak, setStreak] = useState(1);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const checkStreak = async () => {
      // 1. Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('current_streak, last_active_date, activity_log')
        .eq('id', userId)
        .single();

      if (error || !profile) return;

      // 2. PREPARE DATES (Using Strings to avoid Timezone bugs)
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      
      // Handle the case where last_active_date might be null
      const lastActiveStr = profile.last_active_date; 
      
      let newStreak = profile.current_streak;
      let newLog = profile.activity_log || [];

      // 3. LOGIC: Compare Strings directly
      if (lastActiveStr === todayStr) {
        // CASE A: Already logged in today. Do nothing.
        setStreak(newStreak);
        setActivityLog(newLog);
        return; 
      }

      // CASE B: New Login. Calculate gap.
      // We parse the string manually to prevent the "Yesterday" shift
      const lastLoginDate = lastActiveStr ? parseISO(lastActiveStr) : new Date();
      const diff = differenceInCalendarDays(today, lastLoginDate);

      if (diff === 1) {
        newStreak += 1; // Consecutive day
      } else if (diff > 1) {
        newStreak = 1; // Missed a day (or first login), reset to 1
      }
      
      // Edge Case: If diff is 0 (same day), we shouldn't be here because of the string check above,
      // but just in case, we keep the streak as is.

      // 4. UPDATE LOG (Add today if missing)
      if (!newLog.includes(todayStr)) {
        newLog.push(todayStr);
      }

      // 5. SAVE TO DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          last_active_date: todayStr, // Save as simple string
          current_streak: newStreak,
          activity_log: newLog
        })
        .eq('id', userId);

      if (!updateError) {
        setStreak(newStreak);
        setActivityLog(newLog);
      }
    };

    checkStreak();
  }, [userId]);

  return { streak, activityLog };
};