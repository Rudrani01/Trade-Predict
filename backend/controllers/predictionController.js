import { fetchAndStorePrediction, predictAllCompanies } from '../services/mlService.js';
import { getLatestPrediction, getAllLatestPredictions } from '../models/predictionModel.js';

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

export const getAllPredictions = async (req, res) => {
  try {
    const data = await getAllLatestPredictions();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const triggerAllPredictions = async (req, res) => {
  try {
    const { companies } = req.body;
    if (!companies?.length) {
      return res.status(400).json({ error: 'companies array required' });
    }
    res.json({ message: 'Bulk prediction started', count: companies.length });
    predictAllCompanies(companies).catch(err =>
      console.error('Bulk prediction error:', err)
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};