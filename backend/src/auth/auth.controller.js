import * as authService from './auth.service.js'
import passport from '../config/passport.js'
import { generateToken } from '../config/passport.js'

export const register = async (req, res) => {
    try {
        const result = await authService.register(req.body)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const token = await authService.login(req.body)
        res.json({ token })
    } catch (error) {
        res.status(401).json({ error: error.message })
    }
}

// Google OAuth callback
export const googleCallback = async (req, res) => {
    try {
        passport.authenticate('google', { session: false }, async (err, user) => {
            if (err || !user) {
                return res.redirect(`${process.env.FRONTEND_URL}/auth?error=${encodeURIComponent(err?.message || 'Authentication failed')}`);
            }

            const token = generateToken(user);

            return res.redirect(`${process.env.FRONTEND_URL}/auth?token=${token}`);
        })(req, res);
    } catch (error) {
        console.error('Google callback error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/auth?error=${encodeURIComponent('Authentication failed')}`);
    }
}
