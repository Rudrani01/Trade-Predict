import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../supabase/config';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', terms: false });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginData.email, password: loginData.password });
      if (error) throw error;
      setSuccess('Successfully logged in!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) { setError(error.message); }
    finally { setLoading(false); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!registerData.terms) { setError('Please accept the terms and conditions'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerData.email, password: registerData.password, fullName: registerData.username })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      if (data.session) await supabase.auth.setSession(data.session);
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) { setError(error.message); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!loginData.email) { setError('Please enter your email address first'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) { setError(error.message); } else { setSuccess('Password reset link sent to your email!'); }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const inputClass = "w-full px-4 py-3 border-b-2 border-gray-300 dark:border-gray-700 focus:border-[#5044E5] outline-none transition-colors bg-transparent text-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-white/75 disabled:opacity-50";

  const GoogleButton = () => (
    <>
      <div className="relative flex items-center justify-center mb-5 mt-0">
        <div className="border-t border-gray-300 dark:border-gray-700 w-full"></div>
        <span className="absolute bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-white/75">or</span>
      </div>
      <button type="button" onClick={handleGoogleSignIn} disabled={loading}
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </>
  );

  return (
    <div className="flex items-center justify-center px-4 py-20 sm:px-12 lg:px-24 xl:px-40 w-full overflow-hidden text-gray-700 dark:text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-100 dark:shadow-white/10 p-6 sm:p-8 border border-gray-200 dark:border-gray-700"
      >
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-400 rounded-lg text-sm">
            {success}
          </motion.div>
        )}

        {/* Toggle */}
        <div className="relative w-64 mx-auto mb-8 bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700">
          <div className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-gradient-to-r from-[#5044E5] to-[#4d8cea] rounded-full transition-all duration-500 ease-in-out ${isLogin ? 'left-1' : 'left-[calc(50%+4px-1px)]'}`} />
          <button type="button" onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`relative z-10 w-1/2 py-3 font-semibold rounded-full transition-colors duration-300 ${isLogin ? 'text-white' : 'text-gray-700 dark:text-white'}`}
            disabled={loading}>Login</button>
          <button type="button" onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`relative z-10 w-1/2 py-3 font-semibold rounded-full transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-gray-700 dark:text-white'}`}
            disabled={loading}>Register</button>
        </div>

        {/* Login Form */}
        {isLogin && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <input type="email" name="email" placeholder="Email Address"
              value={loginData.email} onChange={handleLoginChange} required disabled={loading} className={inputClass} />
            <input type="password" name="password" placeholder="Enter Password"
              value={loginData.password} onChange={handleLoginChange} required disabled={loading} className={inputClass} />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" name="remember"
                  checked={loginData.remember} onChange={handleLoginChange}
                  disabled={loading} className="w-4 h-4 accent-[#5044E5] cursor-pointer" />
                <label htmlFor="remember" className="text-sm text-gray-500 dark:text-white/75 cursor-pointer">Remember Password</label>
              </div>
              <button type="button" onClick={handleForgotPassword}
                className="text-sm text-[#5044E5] hover:underline" disabled={loading}>Forgot Password?</button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#5044E5] to-[#4d8cea] text-white py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <GoogleButton />
          </form>
        )}

        {/* Register Form */}
        {!isLogin && (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <input type="text" name="username" placeholder="Username"
              value={registerData.username} onChange={handleRegisterChange} required disabled={loading} className={inputClass} />
            <input type="email" name="email" placeholder="Email Address"
              value={registerData.email} onChange={handleRegisterChange} required disabled={loading} className={inputClass} />
            <input type="password" name="password" placeholder="Enter Password (min 6 characters)"
              value={registerData.password} onChange={handleRegisterChange} required disabled={loading} minLength={6} className={inputClass} />
            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" id="terms" name="terms"
                checked={registerData.terms} onChange={handleRegisterChange}
                disabled={loading} className="w-4 h-4 accent-[#5044E5] cursor-pointer" />
              <label htmlFor="terms" className="text-sm text-gray-500 dark:text-white/75 cursor-pointer">I agree to the terms and conditions</label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#5044E5] to-[#4d8cea] text-white py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating Account...' : 'Register'}
            </button>
            <GoogleButton />
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;