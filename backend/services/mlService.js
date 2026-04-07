import { insertPrediction } from '../models/predictionModel.js';

export const fetchAndStorePrediction = async (company) => {
  console.log('ENV CHECK - ML_MODEL_URL:', process.env.ML_MODEL_URL);
  console.log('ENV CHECK - SUPABASE_URL:', process.env.SUPABASE_URL);

  if (!process.env.ML_MODEL_URL) {
    throw new Error('ML_MODEL_URL environment variable is not set');
  }

  console.log('Calling ML model with company:', company);

  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    response = await fetch(process.env.ML_MODEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company })
    });

    console.log(`Attempt ${attempt} - ML response status:`, response.status);

    if (response.status !== 429) break;

    console.log(`Rate limited, retrying in ${attempt * 2}s...`);
    await new Promise(res => setTimeout(res, attempt * 2000));
  }

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