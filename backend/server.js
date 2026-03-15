import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import predictionRoutes from './routes/predictionRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

app.use('/api/predictions', predictionRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Backend running'));

app.listen(5000, () => console.log('Server running on port 5000'));