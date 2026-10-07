import { supabase } from './supabase';

export interface SupabaseRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  content: any;
  created_at?: string;
}

/**
 * Save a generated recommendation to Supabase recommendations table.
 */
export const saveRecommendation = async (
  userId: string,
  recommendationType: string,
  content: any
): Promise<{ data: SupabaseRecommendation | null; error: Error | null }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    const currentUserId = user.id;

    const payload = {
      user_id: currentUserId,
      recommendation_type: recommendationType,
      content: content,
    };

    const { data, error } = await supabase
      .from('recommendations')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error saving recommendation to Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error in saveRecommendation:', err);
    return { data: null, error: err };
  }
};

/**
 * Retrieve saved recommendations for the current authenticated user.
 */
export const getRecommendations = async (
  userId?: string,
  limit = 20
): Promise<{ data: SupabaseRecommendation[] | null; error: Error | null }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    const currentUserId = user.id;

    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recommendations from Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error in getRecommendations:', err);
    return { data: null, error: err };
  }
};
