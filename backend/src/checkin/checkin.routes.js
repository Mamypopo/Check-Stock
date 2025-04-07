import express from 'express';
import * as checkinController from './checkin.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/checkins', verifyToken, checkinController.createCheckin);
router.get('/jobs/:jobId/checkins', verifyToken, checkinController.getCheckinsByJobId);
router.get('/checkins/:id', verifyToken, checkinController.getCheckinById);

export default router; 