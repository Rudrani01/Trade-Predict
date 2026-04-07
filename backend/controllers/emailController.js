import { createClient } from '@supabase/supabase-js';
import { sendDigestEmail } from '../services/emailService.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const sendHourlyPredictionEmails = async (predictions) => {
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