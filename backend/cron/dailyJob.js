import cron from 'node-cron';
import { fetchAndStorePrediction } from '../services/mlService.js';
import { sendHourlyPredictionEmails } from '../controllers/emailController.js';

const companies = [
  'Adani Enterprises', 'Adani Ports & SEZ', 'Apollo Hospitals',
  // ... rest of your companies list
];

cron.schedule('0 9-16 * * 1-5', async () => {
  console.log('⏰ Hourly prediction + email job started...');
  const predictions = [];

  for (const company of companies) {
    try {
      const result = await fetchAndStorePrediction(company);
      if (result) predictions.push({ company, ...result });
      console.log(`✅ Prediction done: ${company}`);
    } catch (err) {
      console.error(`❌ ${company}:`, err.message);
    }
  }

  await sendHourlyPredictionEmails(predictions);
  console.log('🎉 Job complete.');

}, { timezone: 'Asia/Kolkata' });