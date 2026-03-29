import cron from 'node-cron';
import { fetchAndStorePrediction } from '../services/mlService.js';

const companies = [
  'Adani Enterprises', 'Adani Ports & SEZ', 'Apollo Hospitals',
  'Asian Paints', 'Axis Bank', 'Bajaj Auto', 'Bajaj Finance',
  'Bajaj Finserv', 'Bharat Electronics', 'Bharti Airtel',
  'Cipla', 'Coal India', "Dr. Reddy's Laboratories",
  'Eicher Motors', 'Grasim Industries', 'HCLTech',
  'HDFC Bank', 'HDFC Life', 'Hero MotoCorp',
  'Hindalco Industries', 'Hindustan Unilever', 'ICICI Bank',
  'IndusInd Bank', 'Infosys', 'ITC',
  'Jio Financial Services', 'JSW Steel', 'Kotak Mahindra Bank',
  'Larsen & Toubro', 'Mahindra & Mahindra', 'Maruti Suzuki',
  'Nestlé India', 'NTPC', 'Oil and Natural Gas Corporation',
  'Power Grid', 'Reliance Industries', 'SBI Life Insurance Company',
  'Shriram Finance', 'State Bank of India', 'Sun Pharma',
  'Tata Consultancy Services', 'Tata Consumer Products',
  'Tata Motors', 'Tata Steel', 'Tech Mahindra',
  'Titan Company', 'Trent', 'UltraTech Cement', 'Wipro'
];

cron.schedule('0 9 * * 1-5', async () => {
  console.log('Running daily prediction job...');
  try {
    for (const company of companies) {
      await fetchAndStorePrediction(company);
      console.log(`✅ Prediction stored for ${company}`);
    }
    console.log('All predictions done!');
  } catch (error) {
    console.error('Cron job error:', error);
  }
}, {
  timezone: 'Asia/Kolkata'
});