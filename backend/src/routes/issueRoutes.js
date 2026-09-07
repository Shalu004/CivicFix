import express from 'express';
import { createIssue, getIssues, getIssueById, toggleVote, getMyDashboard } from '../controllers/issueController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getIssues);
router.post('/', authMiddleware, upload.single('image'), createIssue);
router.get('/my/dashboard', authMiddleware, getMyDashboard);
router.get('/:id', getIssueById);
router.post('/:id/vote', authMiddleware, toggleVote);

export default router;
