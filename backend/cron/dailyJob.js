import cron from 'node-cron';
import { fetchAndStorePrediction } from '../services/mlService.js';

// runs every weekday at 9am IST
cron.schedule('0 9 * * 1-5', async () => {
  console.log('Running daily prediction job...');
  try {
    await fetchAndStorePrediction('All');
    console.log('Prediction stored successfully');
  } catch (error) {
    console.error('Cron job error:', error);
  }
}, {
  timezone: 'Asia/Kolkata'
});