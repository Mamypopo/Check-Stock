import prisma from '../config/database.js'

export const logAction = async ({ action, userId, jobId, targetType, targetId, details }) => {
    await prisma.log.create({
        data: {
            action,
            userId,
            jobId,
            targetType,
            targetId,
            details
        }
    })
}
