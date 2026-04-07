import { supabase } from '../config/supabaseConfig.js';

export const insertPrediction = async (data) => {
  const { error } = await supabase.from('predictions').insert({
    company: data.company,
    advice: data.advice,
    bullish_percentage: data.bullish_percentage,  // ✅ consistent naming
    bearish_percentage: data.bearish_percentage,  // ✅ consistent naming
    confidence: data.confidence
  });

  if (error) throw error;
};

export const getLatestPrediction = async (company) => {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('company', company)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};