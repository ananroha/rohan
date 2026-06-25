import { supabase } from '../lib/supabase';
import { FeedbackVote, Feedback } from '../types';

export async function submitFeedback(
  toiletId: string,
  userId: string,
  vote: FeedbackVote,
  comment?: string
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ toilet_id: toiletId, user_id: userId, vote, comment })
    .select()
    .single();
  if (error) throw error;
  return data as Feedback;
}

export async function getToiletFeedback(toiletId: string) {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('toilet_id', toiletId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Feedback[];
}
