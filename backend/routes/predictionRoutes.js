import express from 'express';
import {
  getPrediction,
  triggerPrediction,
  getAllPredictions,
  triggerAllPredictions
} from '../controllers/predictionController.js';

const router = express.Router();

router.get('/all', getAllPredictions);
router.post('/trigger-all', triggerAllPredictions);
router.post('/trigger', triggerPrediction);
router.get('/:company', getPrediction);

export default router;