import express from 'express';
import { analyzeAndSaveCFG } from '../controllers/cfgController.js';

const router = express.Router();

router.post('/analyze', analyzeAndSaveCFG);

export default router;