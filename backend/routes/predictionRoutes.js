import express from 'express';
import { getPrediction, triggerPrediction } from '../controllers/predictionController.js';

const router = express.Router();

router.post('/trigger', triggerPrediction);
router.get('/:company', getPrediction);

export default router;