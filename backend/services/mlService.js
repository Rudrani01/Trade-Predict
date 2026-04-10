import { insertPrediction, getLatestPrediction } from '../models/predictionModel.js';

// Smart TTL — respects market hours (IST)
const isFreshEnough = (timestamp) => {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const nowIST = new Date(now.getTime() + IST_OFFSET);
  const predIST = new Date(new Date(timestamp).getTime() + IST_OFFSET);

  const marketOpen  = new Date(nowIST); marketOpen.setHours(9, 15, 0, 0);
  const marketClose = new Date(nowIST); marketClose.setHours(15, 30, 0, 0);

  const isMarketOpen = nowIST >= marketOpen && nowIST <= marketClose;

  if (!isMarketOpen) {
    // Outside market hours — any prediction from today is valid
    return predIST.toDateString() === nowIST.toDateString();
  }

  // During market hours — 15-min TTL
  return (now - new Date(timestamp)) < 15 * 60 * 1000;
};

export const fetchAndStorePrediction = async (company) => {
  if (!process.env.ML_MODEL_URL) {
    throw new Error('ML_MODEL_URL environment variable is not set');
  }

  // Return cached prediction if still fresh — skip ML call entirely
  const existing = await getLatestPrediction(company);
  if (existing?.timestamp && isFreshEnough(existing.timestamp)) {
    console.log(`Cache hit for ${company}`);
    return existing;
  }

  console.log(`Calling ML model for: ${company}`);

  // 15s timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await fetch(process.env.ML_MODEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company }),
        signal: controller.signal
      });

      console.log(`Attempt ${attempt} - status: ${response.status}`);
      if (response.status !== 429) break;

      console.log(`Rate limited, retrying in ${attempt * 2}s...`);
      await new Promise(r => setTimeout(r, attempt * 2000));
    }
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ML model error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  console.log(`ML result for ${company}:`, JSON.stringify(data));

  await insertPrediction({
    company,
    advice: data.advice,
    bullish_percentage: data.bullish_percentage,
    bearish_percentage: data.bearish_percentage,
    confidence: data.confidence ?? null
  });

  return data;
};

// Bulk predict all companies — skips fresh ones automatically
export const predictAllCompanies = async (companies) => {
  const results = [];
  for (const company of companies) {
    try {
      const data = await fetchAndStorePrediction(company); // cache check is inside
      results.push({ company, data });
      console.log(`Done: ${company}`);
    } catch (err) {
      console.error(`Failed for ${company}:`, err.message);
      results.push({ company, error: err.message });
    }
    // Small gap between ML calls to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  return results;
};