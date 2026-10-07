import { supabase } from './supabase';
import { ActivityType, TemperatureUnit, UserPreferences, UserProfile } from '../types';

export interface SupabaseUserPreferences {
  id?: string;
  user_id: string;
  activities: string[];
  preferred_units: string;
  morning_or_evening: string | null;
  commute_start: string | null;
  commute_end: string | null;
  notifications_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export const formatHourToTime = (hour?: number): string => {
  if (hour === undefined || hour === null || isNaN(hour)) return '09:00:00';
  const h = Math.max(0, Math.min(23, Math.floor(hour)));
  return `${h.toString().padStart(2, '0')}:00:00`;
};

export const parseTimeToHour = (timeStr?: string | null): number => {
  if (!timeStr) return 9;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  return isNaN(h) ? 9 : h;
};

/**
 * Fetch preferences for a specific user from Supabase user_preferences table.
 */
export const getUserPreferences = async (
  userId?: string
): Promise<{ data: SupabaseUserPreferences | null; error: Error | null }> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return { data: null, error: sessionError || new Error('User not authenticated') };
    }

    const currentUserId = session.user.id;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user preferences from Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error in getUserPreferences:', err);
    return { data: null, error: err };
  }
};

/**
 * Save / Upsert preferences for a specific user in Supabase user_preferences table.
 */
export const saveUserPreferences = async (
  userId: string,
  preferences: {
    activities: string[];
    preferredUnits: TemperatureUnit;
    morningOrEvening?: 'morning' | 'afternoon' | 'evening' | 'night' | string;
    commuteStartHour?: number;
    commuteEndHour?: number;
    notificationsEnabled?: boolean;
  }
): Promise<{ data: SupabaseUserPreferences | null; error: Error | null }> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return { data: null, error: sessionError || new Error('User not authenticated') };
    }

    const currentUserId = session.user.id;

    const payload = {
      user_id: currentUserId,
      activities: preferences.activities,
      preferred_units: preferences.preferredUnits,
      morning_or_evening: preferences.morningOrEvening || 'evening',
      commute_start: formatHourToTime(preferences.commuteStartHour ?? 18),
      commute_end: formatHourToTime(preferences.commuteEndHour ?? 19),
      notifications_enabled: preferences.notificationsEnabled ?? true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving user preferences to Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error in saveUserPreferences:', err);
    return { data: null, error: err };
  }
};
