import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { supabase, API_URL } from '../supabase/config';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Tradepredict_logo.png';
import ReviewModal from '../pages/ReviewModal';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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

// Reverse map: full backend name → short display name
const REVERSE_COMPANY_MAP = Object.fromEntries(
  Object.entries(COMPANY_NAME_MAP).map(([short, full]) => [full, short])
);

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

const ADVICE_KEY_MAP = {
  buy: 'BUY',
  sell: 'SELL',
  strongBuy: 'STRONG BUY',
  strongSell: 'STRONG SELL'
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word, i) => (
        <text key={i} x={0} y={0} dy={16 + i * 14} textAnchor="middle" fill="#6B7280" fontSize={12}>
          {word}
        </text>
      ))}
    </g>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('Infosys');
  const [selectedAdvice, setSelectedAdvice] = useState({
    buy: false, sell: false, strongBuy: false, strongSell: false
  });
  // Dynamic keys — full backend company name as key
  const [selectedTopCompanies, setSelectedTopCompanies] = useState({});
  const [allPredictions, setAllPredictions] = useState({});
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

  const triggeredRef = useRef(false);

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

  const updateCharts = useCallback((data) => {
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
  }, []);

  const filteredCompanies = useMemo(() => {
    const anyChecked = Object.values(selectedAdvice).some(Boolean);
    if (!anyChecked) return nifty50Companies;

    const activeAdviceTypes = Object.entries(selectedAdvice)
      .filter(([, checked]) => checked)
      .map(([key]) => ADVICE_KEY_MAP[key]);

    return nifty50Companies.filter(company => {
      const mapped = COMPANY_NAME_MAP[company] || company;
      const prediction = allPredictions[mapped];
      return prediction && activeAdviceTypes.includes(prediction.advice);
    });
  }, [selectedAdvice, allPredictions]);

  // ── Dynamic Top 5 from backend, sorted ascending by bullish % ───────────────
  const sortedTopCompanies = useMemo(() => {
    const entries = Object.entries(allPredictions);
    if (entries.length === 0) return [];

    return [...entries]
      .sort((a, b) => a[1].bullish_percentage - b[1].bullish_percentage)
      .slice(0, 5)
      .map(([name, prediction]) => ({
        name,                                          // full backend name
        label: REVERSE_COMPANY_MAP[name] || name,     // short display name
        bullish_percentage: prediction.bullish_percentage,
        advice: prediction.advice
      }));
  }, [allPredictions]);

  // ── Company rank by bullish % (ascending — rank 1 = lowest bullish) ─────────
  const companyRank = useMemo(() => {
    const entries = Object.entries(allPredictions);
    if (entries.length === 0) return null;

    const mapped = COMPANY_NAME_MAP[selectedCompany] || selectedCompany;
    if (!allPredictions[mapped]) return null;

    const sorted = [...entries].sort((a, b) => a[1].bullish_percentage - b[1].bullish_percentage);
    const rank = sorted.findIndex(([name]) => name === mapped) + 1;
    return { rank, total: sorted.length };
  }, [selectedCompany, allPredictions]);
  // ────────────────────────────────────────────────────────────────────────────

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

  // Keep backend alive
  useEffect(() => {
    const ping = () => fetch(`${API_URL}/health`).catch(() => { });
    ping();
    const interval = setInterval(ping, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // On mount: load cached predictions + trigger background refresh (once only)
  useEffect(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    const initDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/predictions/all`);
        const cached = await res.json();

        if (Array.isArray(cached) && cached.length > 0) {
          const map = {};
          cached.forEach(p => { map[p.company] = p; });
          setAllPredictions(map);

          const mapped = COMPANY_NAME_MAP[selectedCompany] || selectedCompany;
          if (map[mapped]) {
            updateCharts(map[mapped]);
            setPredicting(false);
          }
        }
      } catch (err) {
        console.error('Init load error:', err);
      } finally {
        setInitializing(false);
      }

      const allMapped = nifty50Companies.map(c => COMPANY_NAME_MAP[c] || c);
      fetch(`${API_URL}/api/predictions/trigger-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: allMapped })
      }).catch(() => { });
    };

    initDashboard();
  }, []);

  // Company switch
  useEffect(() => {
    if (!selectedCompany) return;
    const mapped = COMPANY_NAME_MAP[selectedCompany] || selectedCompany;

    if (allPredictions[mapped]) {
      updateCharts(allPredictions[mapped]);
      setPredicting(false);
    } else if (!initializing) {
      setPredicting(true);
      fetch(`${API_URL}/api/predictions/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: mapped })
      })
        .then(r => r.json())
        .then(data => {
          if (data && !data.error) {
            updateCharts(data);
            setAllPredictions(prev => ({ ...prev, [mapped]: data }));
          }
        })
        .catch(console.error)
        .finally(() => setPredicting(false));
    }
  }, [selectedCompany, allPredictions, initializing, updateCharts]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('predictions-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'predictions' },
        (payload) => {
          const incoming = payload.new;
          setAllPredictions(prev => ({ ...prev, [incoming.company]: incoming }));
          const mapped = COMPANY_NAME_MAP[selectedCompany] || selectedCompany;
          if (incoming.company === mapped) updateCharts(incoming);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedCompany, updateCharts]);

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

  const handleAdviceChange = (key) => {
    setSelectedAdvice(prev => {
      const updated = { ...prev, [key]: !prev[key] };

      const anyChecked = Object.values(updated).some(Boolean);
      if (anyChecked) {
        const activeAdviceTypes = Object.entries(updated)
          .filter(([, checked]) => checked)
          .map(([k]) => ADVICE_KEY_MAP[k]);

        const mapped = COMPANY_NAME_MAP[selectedCompany] || selectedCompany;
        const currentPrediction = allPredictions[mapped];
        const currentStillValid = currentPrediction && activeAdviceTypes.includes(currentPrediction.advice);

        if (!currentStillValid) {
          const firstMatch = nifty50Companies.find(company => {
            const m = COMPANY_NAME_MAP[company] || company;
            const p = allPredictions[m];
            return p && activeAdviceTypes.includes(p.advice);
          });
          if (firstMatch) setSelectedCompany(firstMatch);
        }
      }

      return updated;
    });
  };

  // ── Top 5 checkbox handler — uses full backend name as key ──────────────────
  const handleTopCompanyChange = (fullName) => {
    setSelectedTopCompanies(prev => {
      const isCurrentlyChecked = !!prev[fullName];
      const reset = Object.fromEntries(Object.keys(prev).map(k => [k, false]));
      return isCurrentlyChecked ? reset : { ...reset, [fullName]: true };
    });

    // Convert full backend name → short dropdown name and update selected company
    const shortName = REVERSE_COMPANY_MAP[fullName] || fullName;
    setSelectedCompany(shortName);
  };
  // ────────────────────────────────────────────────────────────────────────────

  const getAdviceColor = (adv) => {
    if (!adv) return 'text-gray-800';
    if (adv === 'STRONG BUY') return 'text-green-700';
    if (adv === 'BUY') return 'text-green-500';
    if (adv === 'STRONG SELL') return 'text-red-700';
    if (adv === 'SELL') return 'text-red-500';
    return 'text-yellow-500';
  };

  const anyAdviceChecked = Object.values(selectedAdvice).some(Boolean);

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
                <span className="text-sm text-gray-600">{userData?.full_name || 'User'}</span>
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
                    <p className="text-sm font-semibold text-gray-900">{userData?.full_name || 'User'}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
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
            <label className="block text-sm font-medium text-white mb-2">
              Company
              {anyAdviceChecked && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {filteredCompanies.length} match
                </span>
              )}
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2.5 border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white focus:ring-2 focus:ring-white/50 outline-none"
            >
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <option key={company} value={company} className="text-gray-900 bg-white">
                    {company}
                  </option>
                ))
              ) : anyAdviceChecked ? (
                <option disabled className="text-gray-400 bg-white">No matches found</option>
              ) : (
                nifty50Companies.map((company) => (
                  <option key={company} value={company} className="text-gray-900 bg-white">
                    {company}
                  </option>
                ))
              )}
            </select>
          </div>

          {initializing && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
              <p className="text-sm text-white animate-pulse">⏳ Loading all predictions...</p>
            </div>
          )}
          {!initializing && predicting && (
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
              {['buy', 'sell', 'strongBuy', 'strongSell'].map((key) => {
                const adviceValue = ADVICE_KEY_MAP[key];
                const count = Object.values(allPredictions).filter(p => p.advice === adviceValue).length;
                return (
                  <label key={key} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedAdvice[key]}
                        onChange={() => handleAdviceChange(key)}
                        className="w-4 h-4 accent-white cursor-pointer"
                      />
                      <span className="text-sm text-white group-hover:text-white/80 transition-colors">
                        {key === 'strongBuy' ? 'STRONG BUY' : key === 'strongSell' ? 'STRONG SELL' : key.toUpperCase()}
                      </span>
                    </div>
                    {count > 0 && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                        {count}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Top 5 Company — fully dynamic from backend ────────────────────── */}
          <div>
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-sm font-medium text-white">
              <span>Top 5 Company</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <p className="mt-2 text-xs text-white/60 pl-1 italic">
              Sorted by bullish % (lowest first)
            </p>
            <div className="mt-3 space-y-2.5 pl-2">
              {sortedTopCompanies.length === 0 ? (
                <p className="text-xs text-white/50 italic">Loading...</p>
              ) : (
                sortedTopCompanies.map(({ name, label, bullish_percentage }) => (
                  <label key={name} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!selectedTopCompanies[name]}
                        onChange={() => handleTopCompanyChange(name)}
                        className="w-4 h-4 accent-white cursor-pointer"
                      />
                      <span className="text-sm text-white group-hover:text-white/80 transition-colors">
                        {label}
                      </span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                      {bullish_percentage.toFixed(1)}%
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          {/* ─────────────────────────────────────────────────────────────────── */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200"
          >
            <h1 className="text-3xl font-semibold text-gray-700">{getGreeting()}</h1>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Company Rank</p>
              {predicting || !companyRank ? (
                <p className="text-3xl font-bold text-gray-400">—</p>
              ) : (
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-[#5B5FED]">#{companyRank.rank}</p>
                  <p className="text-sm text-gray-400">/ {companyRank.total}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">by bullish %</p>
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
          {/* ✅ closes KPI grid */}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Advice Breakdown</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={adviceData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={(props) => <CustomXAxisTick {...props} />} interval={0} height={50} />
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
          {/* ✅ closes Charts grid */}

        </main>
      
      </div>
   
    </div>
    
  );
};

export default Dashboard;