import express from 'express';
import { linkCommit, getTaskCommits, syncCommits } from '../controllers/commitController.js';

const router = express.Router();

router.post('/', linkCommit);
router.post('/sync', syncCommits);
router.get('/sync', syncCommits);
router.get('/task/:taskId', getTaskCommits);

export default router;
