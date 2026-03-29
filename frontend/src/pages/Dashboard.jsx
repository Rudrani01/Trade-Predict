import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../supabase/config';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Tradepredict_logo.png';
import ReviewModal from '../pages/ReviewModal';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const BACKEND_URL = 'https://trade-predict.onrender.com';

const COMPANY_NAME_MAP = {
  'Adani Ports': 'Adani Ports & SEZ',
  'HCL Tech': 'HCLTech',
  'Reliance': 'Reliance Industries',
  'SBI': 'State Bank of India',
  'SBI Life': 'SBI Life Insurance Company',
  'Nestle': 'Nestlé India',
  'Tata Consumer': 'Tata Consumer Products',
  'Kotak Bank': 'Kotak Mahindra Bank',
  'Grasim': 'Grasim Industries',
  'Hindalco': 'Hindalco Industries',
  'ONGC': 'Oil and Natural Gas Corporation',
  'Titan': 'Titan Company',
  'TCS': 'Tata Consultancy Services',
  'Adani Enterprises': 'Adani Enterprises',
  'Apollo Hospitals': 'Apollo Hospitals',
  'Asian Paints': 'Asian Paints',
  'Axis Bank': 'Axis Bank',
  'Bajaj Auto': 'Bajaj Auto',
  'Bajaj Finance': 'Bajaj Finance',
  'Bajaj Finserv': 'Bajaj Finserv',
  'Bharti Airtel': 'Bharti Airtel',
  'Cipla': 'Cipla',
  'Coal India': 'Coal India',
  "Dr. Reddy's Laboratories": "Dr. Reddy's Laboratories",
  'Eicher Motors': 'Eicher Motors',
  'HDFC Bank': 'HDFC Bank',
  'HDFC Life': 'HDFC Life',
  'Hero MotoCorp': 'Hero MotoCorp',
  'Hindustan Unilever': 'Hindustan Unilever',
  'ICICI Bank': 'ICICI Bank',
  'IndusInd Bank': 'IndusInd Bank',
  'Infosys': 'Infosys',
  'ITC': 'ITC',
  'JSW Steel': 'JSW Steel',
  'Larsen & Toubro': 'Larsen & Toubro',
  'Mahindra & Mahindra': 'Mahindra & Mahindra',
  'Maruti Suzuki': 'Maruti Suzuki',
  'NTPC': 'NTPC',
  'Power Grid': 'Power Grid',
  'Sun Pharma': 'Sun Pharma',
  'Tata Motors': 'Tata Motors',
  'Tata Steel': 'Tata Steel',
  'Tech Mahindra': 'Tech Mahindra',
  'UltraTech Cement': 'UltraTech Cement',
  'Wipro': 'Wipro',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState('Infosys');
  const [selectedAdvice, setSelectedAdvice] = useState({
    buy: false,
    sell: false,
    strongBuy: false,
    strongSell: false
  });
  const [selectedTopCompanies, setSelectedTopCompanies] = useState({
    axisBank: false,
    drReddy: false,
    iciciBank: false,
    tataConsumer: false,
    ultraTech: false
  });

  const [adviceData, setAdviceData] = useState([
    { name: 'BUY', value: 0, color: '#5DA5DA' },
    { name: 'STRONG BUY', value: 0, color: '#0F4C81' },
    { name: 'STRONG SELL', value: 0, color: '#8B0000' },
    { name: 'SELL', value: 0, color: '#DC143C' }
  ]);
  const [confidenceData, setConfidenceData] = useState([
    { name: 'STRONG BUY', value: 50, color: '#1E5BA8' },
    { name: 'STRONG SELL', value: 50, color: '#C41E3A' }
  ]);
  const [bullish, setBullish] = useState(null);
  const [bearish, setBearish] = useState(null);
  const [advice, setAdvice] = useState(null);

  const nifty50Companies = [
    'Adani Enterprises', 'Adani Ports', 'Apollo Hospitals',
    'Asian Paints', 'Axis Bank', 'Bajaj Auto', 'Bajaj Finance',
    'Bajaj Finserv', 'Bharti Airtel', 'Cipla',
    'Coal India', "Dr. Reddy's Laboratories", 'Eicher Motors',
    'Grasim', 'HCL Tech', 'HDFC Bank', 'HDFC Life', 'Hero MotoCorp',
    'Hindalco', 'Hindustan Unilever', 'ICICI Bank', 'IndusInd Bank',
    'Infosys', 'ITC', 'JSW Steel', 'Kotak Bank', 'Larsen & Toubro',
    'Mahindra & Mahindra', 'Maruti Suzuki', 'Nestle', 'NTPC', 'ONGC',
    'Power Grid', 'Reliance', 'SBI', 'SBI Life',
    'Sun Pharma', 'Tata Consumer', 'Tata Motors', 'Tata Steel', 'TCS',
    'Tech Mahindra', 'Titan', 'UltraTech Cement', 'Wipro'
  ];

  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    return {
      day: days[now.getDay()],
      fullDate: `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
    };
  };

  const { day, fullDate } = getCurrentDate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Night';
  };

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate('/');
      } else {
        setUser(session.user);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setUserData(data);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Trigger prediction from ML model via Node backend
  const triggerPrediction = async (company) => {
    const mappedCompany = COMPANY_NAME_MAP[company] || company;
    setPredicting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/predictions/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: mappedCompany })
      });
      const data = await response.json();
      if (data && !data.error) {
        updateCharts({
          bullish_percentage: data.bullish_percentage,
          bearish_percentage: data.bearish_percentage,
          advice: data.advice,
        });
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setPredicting(false);
    }
  };

  // When company changes, trigger prediction
  useEffect(() => {
    if (selectedCompany) {
      triggerPrediction(selectedCompany);
    }
  }, [selectedCompany]);

  // Realtime Supabase listener
  useEffect(() => {
    const mappedCompany = COMPANY_NAME_MAP[selectedCompany] || selectedCompany;

    // Fetch latest saved prediction first
    const fetchLatest = async () => {
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .eq('company', mappedCompany)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      if (data) updateCharts(data);
    };
    fetchLatest();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('predictions-channel')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'predictions' },
        (payload) => {
          if (payload.new.company === mappedCompany) {
            updateCharts(payload.new);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedCompany]);

  const updateCharts = (data) => {
    setBullish(data.bullish_percentage);
    setBearish(data.bearish_percentage);
    setAdvice(data.advice);

    setAdviceData([
      { name: 'BUY', value: data.bullish_percentage, color: '#5DA5DA' },
      { name: 'STRONG BUY', value: data.bullish_percentage * 0.7, color: '#0F4C81' },
      { name: 'STRONG SELL', value: data.bearish_percentage * 0.7, color: '#8B0000' },
      { name: 'SELL', value: data.bearish_percentage, color: '#DC143C' }
    ]);

    setConfidenceData([
      { name: 'STRONG BUY', value: data.bullish_percentage, color: '#1E5BA8' },
      { name: 'STRONG SELL', value: data.bearish_percentage, color: '#C41E3A' }
    ]);
  };

  // Beforeunload review modal
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const lastReviewDate = localStorage.getItem('lastReviewDate');
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (!lastReviewDate || parseInt(lastReviewDate) < sevenDaysAgo) {
        e.preventDefault();
        e.returnValue = '';
        setShowReviewModal(true);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleLogout = () => {
    setLogoutPending(true);
    setShowReviewModal(true);
    setShowProfileMenu(false);
  };

  const completeLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleReviewSubmit = () => {
    setShowReviewModal(false);
    localStorage.setItem('lastReviewDate', Date.now().toString());
    if (logoutPending) completeLogout();
  };

  const handleReviewClose = () => {
    setShowReviewModal(false);
    if (logoutPending) completeLogout();
  };

  const handleAdviceChange = (a) => {
    setSelectedAdvice(prev => ({ ...prev, [a]: !prev[a] }));
  };

  const handleTopCompanyChange = (company) => {
    setSelectedTopCompanies(prev => ({ ...prev, [company]: !prev[company] }));
  };

  const getAdviceColor = (adv) => {
    if (!adv) return 'text-gray-800';
    if (adv === 'STRONG BUY') return 'text-green-700';
    if (adv === 'BUY') return 'text-green-500';
    if (adv === 'STRONG SELL') return 'text-red-700';
    if (adv === 'SELL') return 'text-red-500';
    return 'text-yellow-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ReviewModal
        isOpen={showReviewModal}
        onClose={handleReviewClose}
        onSubmit={handleReviewSubmit}
      />

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Trade Predict Logo" className="h-14" />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <span className="text-sm text-gray-600">
                  {userData?.full_name || 'User'}
                </span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5B8DEE] to-[#4B7FE5] flex items-center justify-center text-white font-semibold">
                  {userData?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {userData?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    Log Out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-gradient-to-b from-[#5B5FED] via-[#5B5FED] to-[#4B4FDD] text-white p-6 space-y-6 min-h-[calc(100vh-64px)] overflow-y-auto shadow-xl">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2.5 border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white focus:ring-2 focus:ring-white/50 outline-none"
            >
              {nifty50Companies.map((company) => (
                <option key={company} value={company} className="text-gray-900 bg-white">
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Prediction status */}
          {predicting && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
              <p className="text-sm text-white animate-pulse">⏳ Fetching prediction...</p>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-sm font-bold text-white">{day}</p>
            <p className="text-xs text-white/80 mt-1">{fullDate}</p>
          </div>

          <div>
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-sm font-medium text-white">
              <span>Advice</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="mt-3 space-y-2.5 pl-2">
              {['buy', 'sell', 'strongBuy', 'strongSell'].map((key) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedAdvice[key]}
                    onChange={() => handleAdviceChange(key)}
                    className="w-4 h-4 accent-white cursor-pointer"
                  />
                  <span className="text-sm text-white group-hover:text-white/80 transition-colors">
                    {key === 'strongBuy' ? 'STRONG BUY' : key === 'strongSell' ? 'STRONG SELL' : key.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-sm font-medium text-white">
              <span>Top 5 Company</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="mt-3 space-y-2.5 pl-2">
              {[
                { key: 'axisBank', label: 'Axis Bank' },
                { key: 'drReddy', label: "Dr. Reddy's Laboratory" },
                { key: 'iciciBank', label: 'ICICI Bank' },
                { key: 'tataConsumer', label: 'Tata Consumer' },
                { key: 'ultraTech', label: 'UltraTech Cement' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTopCompanies[key]}
                    onChange={() => handleTopCompanyChange(key)}
                    className="w-4 h-4 accent-white cursor-pointer"
                  />
                  <span className="text-sm text-white group-hover:text-white/80 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold text-gray-700">{getGreeting()}</h1>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-800">2.50K</p>
                </div>
                <div className="w-16 h-16">
                  <svg viewBox="0 0 36 36">
                    <path stroke="#E5E7EB" strokeWidth="3" fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#5B8DEE" strokeWidth="3" strokeLinecap="round" fill="none"
                      strokeDasharray="75, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Selected Company</p>
              <p className="text-xl font-bold text-gray-800">{selectedCompany}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Bullish Percentage</p>
              <p className="text-3xl font-bold text-green-600">
                {predicting ? '...' : bullish !== null ? `${bullish.toFixed(2)}%` : '—'}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Bearish Percentage</p>
              <p className="text-3xl font-bold text-red-600">
                {predicting ? '...' : bearish !== null ? `${bearish.toFixed(2)}%` : '—'}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Advice</p>
              <p className={`text-2xl font-bold ${getAdviceColor(advice)}`}>
                {predicting ? '...' : advice || '—'}
              </p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Advice Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={adviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {adviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Confidence Level X Advice</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={confidenceData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                    {confidenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#6B7280' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;