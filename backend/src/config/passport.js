import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database.js';
import { logAction } from '../utils/logger.js';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
    return jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {

        let user = await prisma.user.findUnique({
            where: { googleId: profile.id }
        });

        if (!user && profile.emails && profile.emails.length > 0) {
            user = await prisma.user.findUnique({
                where: { email: profile.emails[0].value }
            });
        }

        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: profile.id }
            });
        } else {
            user = await prisma.user.create({
                data: {
                    email: profile.emails[0].value,
                    name: profile.displayName || profile.emails[0].value.split('@')[0],
                    googleId: profile.id,
                    role: 'STAFF'
                }
            });

            await logAction({
                action: 'REGISTER_GOOGLE',
                userId: user.id,
                targetType: 'User',
                targetId: user.id,
                details: {
                    provider: 'google',
                    email: profile.emails?.[0]?.value,
                    name: profile.displayName,
                    googleId: profile.id,
                    registeredAt: new Date().toISOString()
                }
            });
        }

        await logAction({
            action: 'LOGIN_GOOGLE',
            userId: user.id,
            targetType: 'User',
            targetId: user.id,
            details: { provider: 'google', email: user.email }
        });

        return done(null, user);
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error);
    }
}));

export { generateToken };
export default passport; 