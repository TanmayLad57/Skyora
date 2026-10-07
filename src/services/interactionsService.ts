import { supabase } from './supabase';
import { UserInteraction } from '../types';

export interface SupabaseInteraction {
  id: string;
  user_id: string;
  screen_viewed: string | null;
  created_at?: string;
}

/**
 * Record a meaningful screen view in Supabase interactions table.
 */
export const recordInteraction = async (
  userId: string,
  screenViewed: string
): Promise<{ data: SupabaseInteraction | null; error: Error | null }> => {
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
      screen_viewed: screenViewed || 'dashboard',
    };

    const { data, error } = await supabase
      .from('interactions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error recording interaction in Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error in recordInteraction:', err);
    return { data: null, error: err };
  }
};

/**
 * Fetch recorded screen interactions for the current authenticated user.
 */
export const getInteractions = async (
  userId?: string,
  limit = 50
): Promise<{ data: UserInteraction[] | null; error: Error | null }> => {
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
      .from('interactions')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching interactions from Supabase:', error.message);
      return { data: null, error };
    }

    const mapped: UserInteraction[] = (data || []).map((row: SupabaseInteraction) => {
      const ts = row.created_at ? new Date(row.created_at).getTime() : Date.now();
      return {
        id: row.id,
        type: 'view_screen',
        target: row.screen_viewed || 'dashboard',
        timestamp: ts,
        hourOfDay: new Date(ts).getHours(),
      };
    });

    return { data: mapped, error: null };
  } catch (err: any) {
    console.error('Unexpected error in getInteractions:', err);
    return { data: null, error: err };
  }
};
