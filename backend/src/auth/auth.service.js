import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'
import { logAction } from '../utils/logger.js'


export const register = async ({ email, password, name, role }) => {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) throw new Error('อีเมลนี้ถูกใช้งานแล้ว')

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role
        }
    })

    await logAction({
        action: 'register',
        userId: user.id,
        targetType: 'user',
        targetId: user.id
    })

    return {
        message: 'สมัครสมาชิกสำเร็จ',
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
    }
}

export const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('ไม่พบผู้ใช้งาน')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('รหัสผ่านไม่ถูกต้อง')

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    )

    await logAction({
        action: 'login',
        userId: user.id,
        targetType: 'User',
        targetId: user.id,
        details: { email: user.email }
    })

    return token
}
