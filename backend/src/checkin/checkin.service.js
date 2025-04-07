import prisma from '../config/database.js';
import { logAction } from '../utils/logger.js';

export const createCheckin = async (jobId, checkoutId, items, userId) => {
    const job = await prisma.job.findUnique({
        where: { id: parseInt(jobId, 10) }
    });

    if (!job) {
        throw new Error('ไม่พบงานที่ต้องการ');
    }

    if (job.status !== 'IN_PROGRESS') {
        throw new Error('งานไม่อยู่ในสถานะที่สามารถเช็คของเข้าได้');
    }

    return await prisma.$transaction(async (prismaClient) => {
        const checkin = await prismaClient.checkin.create({
            data: {
                jobId: parseInt(jobId, 10),
                userId: userId,
                createdBy: userId,
                items: {
                    create: items.map(item => ({
                        itemId: parseInt(item.itemId, 10),
                        quantity: parseInt(item.quantity, 10),
                        actualQuantity: parseInt(item.actualQuantity, 10),
                        note: item.note
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        item: {
                            include: {
                                category: true,
                                Unit: true
                            }
                        }
                    }
                },
                job: true,
                user: true
            }
        });

        await prismaClient.job.update({
            where: { id: parseInt(jobId, 10) },
            data: { status: 'COMPLETED' }
        });

        for (const item of items) {
            const itemData = await prismaClient.item.findUnique({
                where: { id: parseInt(item.itemId, 10) }
            });

            if (itemData) {
                await prismaClient.item.update({
                    where: { id: parseInt(item.itemId, 10) },
                    data: { stock: itemData.stock + parseInt(item.actualQuantity, 10) }
                });
            }
        }

        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        })

        await logAction({
            action: 'CHECKIN',
            userId,
            jobId: parseInt(jobId, 10),
            targetType: 'Checkin',
            targetId: checkin.id,
            details: {
                jobTitle: job.title,
                jobLocation: job.location,
                checkinBy: user?.name || 'ไม่ระบุ',
                items: items.map(item => {
                    const itemObj = checkin.items.find(i => i.itemId === parseInt(item.itemId, 10));
                    return {
                        itemId: parseInt(item.itemId, 10),
                        name: itemObj?.item.name || 'Unknown',
                        code: itemObj?.item.code || '-',
                        quantity: parseInt(item.quantity, 10),
                        actualQuantity: parseInt(item.actualQuantity, 10),
                        note: item.note || null,
                        status: parseInt(item.actualQuantity, 10) < parseInt(item.quantity, 10)
                            ? (itemObj?.item.isConsumable ? 'USED' : 'MISSING')
                            : 'COMPLETE'
                    };
                }),
                message: `เช็คของเข้าสำหรับงาน ${job.title}`
            }
        });

        return checkin;
    });
};

export const getCheckinsByJobId = async (jobId) => {
    return await prisma.checkin.findMany({
        where: { jobId },
        include: {
            items: {
                include: {
                    item: {
                        include: {
                            category: true,
                            Unit: true
                        }
                    }
                }
            },
            job: true,
            user: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getCheckinById = async (id) => {
    return await prisma.checkin.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    item: {
                        include: {
                            category: true,
                            Unit: true
                        }
                    }
                }
            },
            job: true,
            user: true
        }
    });
}; 