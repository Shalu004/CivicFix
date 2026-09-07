import express from 'express';
import { getAdminIssues, updateAdminIssue, getAdminAnalytics } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminGuard } from '../middleware/adminGuard.js';

const router = express.Router();

router.use(authMiddleware, adminGuard);

router.get('/issues', getAdminIssues);
router.patch('/issues/:id', updateAdminIssue);
router.get('/analytics', getAdminAnalytics);

export default router;
