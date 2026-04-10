import cron from 'node-cron';
import { fetchAndStorePrediction } from '../services/mlService.js';
import { sendHourlyPredictionEmails } from '../controllers/emailController.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const companies = [
  'Adani Enterprises', 'Adani Ports & SEZ', 'Apollo Hospitals',
  'Asian Paints', 'Axis Bank', 'Bajaj Auto', 'Bajaj Finance',
  'Bajaj Finserv', 'Bharti Airtel', 'Cipla', 'Coal India',
  "Dr. Reddy's Laboratories", 'Eicher Motors', 'Grasim Industries',
  'HCLTech', 'HDFC Bank', 'HDFC Life', 'Hero MotoCorp',
  'Hindalco Industries', 'Hindustan Unilever', 'ICICI Bank',
  'IndusInd Bank', 'Infosys', 'ITC', 'JSW Steel',
  'Kotak Mahindra Bank', 'Larsen & Toubro', 'Mahindra & Mahindra',
  'Maruti Suzuki', 'Nestlé India', 'NTPC',
  'Oil and Natural Gas Corporation', 'Power Grid', 'Reliance Industries',
  'State Bank of India', 'SBI Life Insurance Company', 'Sun Pharma',
  'Tata Consumer Products', 'Tata Motors', 'Tata Steel',
  'Tata Consultancy Services', 'Tech Mahindra', 'Titan Company',
  'UltraTech Cement', 'Wipro'
];

// ✅ Keep Supabase alive — lightweight query every 4 days
cron.schedule('0 0 */4 * *', async () => {
  try {
    await supabase.from('profiles').select('id').limit(1);
    console.log('🟢 Supabase keep-alive ping done');
  } catch (err) {
    console.error('❌ Supabase keep-alive failed:', err.message);
  }
});

// ✅ Hourly prediction + email during market hours (9am–4pm IST, Mon–Fri)
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