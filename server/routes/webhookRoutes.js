import express from 'express';
import { handleGitHubPushWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/github', handleGitHubPushWebhook);

export default router;
