import express from 'express';
import { processCFG } from '../controllers/cfgController.js';

const router = express.Router();

router.post('/analyze', processCFG);

export default router;