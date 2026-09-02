import express from 'express';
import { linkCommit, getTaskCommits } from '../controllers/commitController.js';

const router = express.Router();

router.post('/', linkCommit);
router.get('/task/:taskId', getTaskCommits);

export default router;
