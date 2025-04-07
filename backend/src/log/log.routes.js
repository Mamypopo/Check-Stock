import express from 'express'
import logController from './log.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

// ดึงรายการ logs ทั้งหมด (มีการกรอง)
router.get('/', verifyToken, logController.getLogs)

// ดึงรายละเอียด log ตาม ID
router.get('/:id', verifyToken, logController.getLogById)

// สร้าง log ใหม่ (สำหรับการทดสอบหรือใช้จาก frontend โดยตรง)
router.post('/', verifyToken, logController.createLog)

export default router
