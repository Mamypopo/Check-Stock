import express from 'express';
import * as jobItemController from './jobItem.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/jobs/:jobId/items', verifyToken, jobItemController.getJobItems);
router.post('/job-items', verifyToken, jobItemController.addJobItem);
router.put('/job-items/:id', verifyToken, jobItemController.updateJobItem);
router.delete('/job-items/:id', verifyToken, jobItemController.deleteJobItem);

export default router; 