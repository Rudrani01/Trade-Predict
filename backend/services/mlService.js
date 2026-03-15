import { insertPrediction } from '../models/predictionModel.js';

export const fetchAndStorePrediction = async (company) => {
  const response = await fetch(process.env.ML_MODEL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company })
  });

  const data = await response.json();

  await insertPrediction({
    company,
    advice: data.advice,
    bullish: data.bullish_percentage,
    bearish: data.bearish_percentage,
    confidence: data.confidence
  });

  return data;
};