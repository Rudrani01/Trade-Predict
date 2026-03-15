import express from 'express';
import { getPrediction, triggerPrediction } from '../controllers/predictionController.js';

const router = express.Router();

router.get('/:company', getPrediction);
router.post('/trigger', triggerPrediction);

export default router;