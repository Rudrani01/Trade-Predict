import { createClient } from '@supabase/supabase-js';
import { sendDigestEmail } from '../services/emailService.js';
import { getAllLatestPredictions } from '../models/predictionModel.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const sendHourlyPredictionEmails = async () => {
  let predictions;
  try {
    predictions = await getAllLatestPredictions();
    console.log(`📦 Fetched ${predictions.length} predictions from DB`);
  } catch (err) {
    console.error('❌ Failed to fetch predictions from DB:', err.message);
    return;
  }

  if (!predictions || predictions.length === 0) {
    console.warn('⚠️ No predictions in DB — aborting email');
    return;
  }

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, email');

  if (error) {
    console.error('❌ Failed to fetch users:', error.message);
    return;
  }

  console.log(`📬 Sending emails to ${users.length} users...`);

  for (const user of users) {
    try {
      await sendDigestEmail(user, predictions);
      console.log(`✅ Sent to ${user.email}`);
    } catch (err) {
      console.error(`❌ Failed for ${user.email}:`, err.message);
    }
  }
};