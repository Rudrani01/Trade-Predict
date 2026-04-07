import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import predictionRoutes from './routes/predictionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import './cron/dailyJob.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: ['https://tradepredict-five.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions)); // ✅ fixed wildcard for Express 5

app.use(express.json());

app.use('/api/predictions', predictionRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Backend running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));