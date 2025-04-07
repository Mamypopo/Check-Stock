import express from 'express'
import { importExcel } from './excel.controller.js'
import upload from './excel.middleware.js'
import { verifyToken } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/import', verifyToken, upload.single('file'), importExcel)

export default router