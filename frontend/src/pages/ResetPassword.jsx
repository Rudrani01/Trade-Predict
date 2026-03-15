import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../supabase/config';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess('Password updated successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Reset Password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Enter your new password below</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <input
            type="password" placeholder="New Password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={6} disabled={loading}
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#5044E5] outline-none transition-colors bg-transparent disabled:opacity-50"
          />
          <input
            type="password" placeholder="Confirm New Password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            required minLength={6} disabled={loading}
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#5044E5] outline-none transition-colors bg-transparent disabled:opacity-50"
          />
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[#5044E5] to-[#4d8cea] text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 mt-6 disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;