import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import predictionRoutes from './routes/predictionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import './cron/dailyJob.js';

dotenv.config();

const app = express();

// ✅ Fixed CORS - added methods + OPTIONS preflight
app.use(cors({
  origin: ['https://tradepredict-five.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors()); // ✅ handle preflight before routes

app.use(express.json());

app.use('/api/predictions', predictionRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Backend running'));

app.listen(5000, () => console.log('Server running on port 5000'));