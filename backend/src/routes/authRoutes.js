import express from 'express';
import { signup, login, adminLogin, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/me', authMiddleware, getMe);

export default router;
