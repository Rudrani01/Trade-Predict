import { supabase } from '../config/supabaseConfig.js';

export const insertPrediction = async (data) => {
  const { error } = await supabase.from('predictions').insert({
    company: data.company,
    advice: data.advice,
    bullish_percentage: data.bullish_percentage,
    bearish_percentage: data.bearish_percentage,
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

// Fetch latest prediction for every company in a single DB query
export const getAllLatestPredictions = async () => {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;

  // Keep only the most recent row per company
  const seen = new Set();
  return data.filter(row => {
    if (seen.has(row.company)) return false;
    seen.add(row.company);
    return true;
  });
};