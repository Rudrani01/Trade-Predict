import { fetchAndStorePrediction } from '../services/mlService.js';
import { getLatestPrediction } from '../models/predictionModel.js';

export const getPrediction = async (req, res) => {
  try {
    const { company } = req.params;
    const data = await getLatestPrediction(company);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const triggerPrediction = async (req, res) => {
  try {
    const { company } = req.body;
    const data = await fetchAndStorePrediction(company);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};