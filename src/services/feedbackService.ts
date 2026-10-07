import { supabase } from './supabase';
import { CardFeedback } from '../types';

export interface SupabaseFeedback {
  id: string;
  user_id: string;
  recommendation_id: string | null;
  feedback_type: 'positive' | 'negative';
  created_at?: string;
}

/**
 * Submit thumbs up ('positive') or thumbs down ('negative') feedback to Supabase feedback table.
 */
export const submitFeedback = async (
  userId: string,
  recommendationId: string,
  feedbackType: 'positive' | 'negative'
): Promise<{ data: SupabaseFeedback | null; error: Error | null }> => {
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
      recommendation_id: recommendationId,
      feedback_type: feedbackType,
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error submitting feedback to Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error in submitFeedback:', err);
    return { data: null, error: err };
  }
};

/**
 * Fetch all feedback submitted by the current authenticated user.
 */
export const getFeedback = async (
  userId?: string
): Promise<{ data: CardFeedback[] | null; error: Error | null }> => {
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
      .from('feedback')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback from Supabase:', error.message);
      return { data: null, error };
    }

    const mapped: CardFeedback[] = (data || []).map((row: SupabaseFeedback) => ({
      cardId: row.recommendation_id || '',
      cardType: 'recommendation',
      vote: row.feedback_type === 'positive' ? 'up' : 'down',
      timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    console.error('Unexpected error in getFeedback:', err);
    return { data: null, error: err };
  }
};
