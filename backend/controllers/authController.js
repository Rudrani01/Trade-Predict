import { supabase, supabaseAdmin } from '../config/supabaseConfig.js';

export const signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() }
    });

    if (authError) {
      let message = authError.message;
      if (message.includes('already registered')) {
        message = 'This email is already registered. Please login instead.';
      }
      return res.status(400).json({ message });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    await supabaseAdmin
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', authData.user.id);

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (sessionError) {
      return res.status(201).json({ message: 'Signup successful! Please login.' });
    }

    res.status(201).json({
      message: 'Signup successful',
      session: sessionData.session,
      user: sessionData.user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};