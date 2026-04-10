import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import predictionRoutes from './routes/predictionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import './cron/dailyJob.js';
import { sendDigestEmail } from './services/emailService.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: ['https://tradepredict-five.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));
app.use(express.json());

app.use('/api/predictions', predictionRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Backend running'));

// ✅ Health endpoint — required for keep-alive ping from frontend
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Test email route
app.get('/test-email', async (req, res) => {
  const fakeUser = {
    email: 'tradepredict01@gmail.com',
    full_name: 'Test User'
  };
  const fakePredictions = [
    { company: 'Reliance',    advice: 'BUY',        bullish_percentage: 72.5, bearish_percentage: 27.5 },
    { company: 'TCS',         advice: 'STRONG BUY', bullish_percentage: 88.1, bearish_percentage: 11.9 },
    { company: 'Adani Ports', advice: 'SELL',       bullish_percentage: 31.2, bearish_percentage: 68.8 },
  ];

  try {
    await sendDigestEmail(fakeUser, fakePredictions);
    res.json({ success: true, message: 'Email sent! Check your inbox.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));