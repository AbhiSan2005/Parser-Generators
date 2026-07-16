import express from 'express';
import {
    createPlayground,
    getPlayground,
    getUserPlaygrounds,
    saveGrammar,
    compileParser,
    deletePlayground
} from '../controllers/playgroundController.js';

const router = express.Router();

router.post('/', createPlayground);
router.get('/user/:userId', getUserPlaygrounds);
router.get('/:id', getPlayground);
router.put('/:id/grammar', saveGrammar);
router.post('/:id/compile', compileParser);
router.delete('/:id', deletePlayground);

export default router;