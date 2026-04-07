import { insertPrediction } from '../models/predictionModel.js';

export const fetchAndStorePrediction = async (company) => {
  console.log('ENV CHECK - ML_MODEL_URL:', process.env.ML_MODEL_URL);
  console.log('ENV CHECK - SUPABASE_URL:', process.env.SUPABASE_URL);
  
  if (!process.env.ML_MODEL_URL) {
    throw new Error('ML_MODEL_URL environment variable is not set');
  }

  console.log('Calling ML model with company:', company);

  const response = await fetch(process.env.ML_MODEL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company })
  });

  console.log('ML response status:', response.status);

  if (!response.ok) {
    const text = await response.text();
    console.error('ML error body:', text);
    throw new Error(`ML model error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('ML data received:', JSON.stringify(data));

  await insertPrediction({
    company,
    advice: data.advice,
    bullish_percentage: data.bullish_percentage,
    bearish_percentage: data.bearish_percentage,
    confidence: data.confidence ?? null
  });

  return data;
};