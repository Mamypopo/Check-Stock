import express from 'express';
import * as checkoutController from './checkout.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/checkouts', verifyToken, checkoutController.createCheckout);
router.get('/jobs/:jobId/checkouts', verifyToken, checkoutController.getCheckoutsByJobId);
router.get('/checkouts/:id', verifyToken, checkoutController.getCheckoutById);

export default router; 