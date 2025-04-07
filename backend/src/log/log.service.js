import prisma from '../config/database.js'

class LogService {
    async getLogs({ page = 1, limit = 10, action, startDate, endDate, userId, targetType, targetId }) {
        try {
            const skip = (parseInt(page) - 1) * parseInt(limit)

            // สร้างเงื่อนไขการค้นหา
            const where = {}

            if (action) {
                where.action = action
            }

            if (userId) {
                where.userId = userId
            }

            if (targetType) {
                where.targetType = targetType
            }

            if (targetId) {
                where.targetId = targetId
            }

            if (startDate || endDate) {
                where.createdAt = {}

                if (startDate) {
                    where.createdAt.gte = new Date(startDate)
                }

                if (endDate) {
                    // ตั้งเวลาเป็น 23:59:59 ของวันที่เลือก
                    const endDateTime = new Date(endDate)
                    endDateTime.setHours(23, 59, 59, 999)
                    where.createdAt.lte = endDateTime
                }
            }

            // ดึงข้อมูล logs
            const [logs, total] = await Promise.all([
                prisma.log.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip,
                    take: parseInt(limit)
                }),
                prisma.log.count({ where })
            ])

            return {
                logs,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        } catch (error) {
            console.error('Error fetching logs:', error)
            throw new Error('ไม่สามารถดึงข้อมูล log ได้')
        }
    }

    async getLogById(id) {
        try {
            const log = await prisma.log.findUnique({
                where: { id: parseInt(id) },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            })

            if (!log) {
                throw new Error('ไม่พบ log ที่ต้องการ')
            }

            return log
        } catch (error) {
            console.error('Error fetching log by id:', error)
            throw new Error('ไม่สามารถดึงข้อมูล log ได้')
        }
    }

    // ฟังก์ชันสำหรับบันทึก log การเข้าสู่ระบบ
    async logLogin(userId, details = {}) {
        return this.createLog({
            action: 'login',
            userId,
            targetType: 'user',
            targetId: userId,
            details: {
                ...details,
                message: details.message || 'เข้าสู่ระบบสำเร็จ'
            }
        })
    }

    // ฟังก์ชันสำหรับบันทึก log การออกจากระบบ
    async logLogout(userId, details = {}) {
        return this.createLog({
            action: 'logout',
            userId,
            targetType: 'user',
            targetId: userId,
            details: {
                ...details,
                message: details.message || 'ออกจากระบบสำเร็จ'
            }
        })
    }

    // ฟังก์ชันสำหรับบันทึก log การสร้างรายการ
    async logCreate(userId, targetType, targetId, details = {}) {
        return this.createLog({
            action: 'create',
            userId,
            targetType,
            targetId,
            details: {
                ...details,
                message: details.message || `สร้าง ${targetType} สำเร็จ`
            }
        })
    }

    // ฟังก์ชันสำหรับบันทึก log การแก้ไขรายการ
    async logUpdate(userId, targetType, targetId, details = {}) {
        return this.createLog({
            action: 'update',
            userId,
            targetType,
            targetId,
            details: {
                ...details,
                message: details.message || `แก้ไข ${targetType} สำเร็จ`
            }
        })
    }

    // ฟังก์ชันสำหรับบันทึก log การลบรายการ
    async logDelete(userId, targetType, targetId, details = {}) {
        return this.createLog({
            action: 'delete',
            userId,
            targetType,
            targetId,
            details: {
                ...details,
                message: details.message || `ลบ ${targetType} สำเร็จ`
            }
        })
    }
}

export default new LogService() 