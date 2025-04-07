import express from 'express'
import { register, login, googleCallback } from './auth.controller.js'
import passport from '../config/passport.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

// OAuth 
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', googleCallback)

export default router
