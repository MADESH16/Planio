import express from 'express';
import { register, login, getMe, getUsers } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', getUsers);

export default router;
