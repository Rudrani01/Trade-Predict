import { insertPrediction } from '../models/predictionModel.js';

export const fetchAndStorePrediction = async (company) => {
  if (!process.env.ML_MODEL_URL) {
    throw new Error('ML_MODEL_URL environment variable is not set');
  }

  const response = await fetch(process.env.ML_MODEL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company })
  });

  if (!response.ok) {
    throw new Error(`ML model error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  await insertPrediction({
    company,
    advice: data.advice,
    bullish_percentage: data.bullish_percentage,  // ✅ matches predictionModel
    bearish_percentage: data.bearish_percentage,  // ✅ matches predictionModel
    confidence: data.confidence ?? null           // ✅ proper confidence value
  });

  return data;
};