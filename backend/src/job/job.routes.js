import express from 'express';
import * as jobController from './job.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/', verifyToken, jobController.createJob);
router.get('/', verifyToken, jobController.getJobs);
router.get('/:id', verifyToken, jobController.getJobById);
router.put('/:id', verifyToken, jobController.updateJob);
router.delete('/:id', verifyToken, jobController.deleteJob);

export default router;