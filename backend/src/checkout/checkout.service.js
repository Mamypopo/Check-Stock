import prisma from '../config/database.js';
import { logAction } from '../utils/logger.js';
import {
    sendLineGroupMessage,
    createCheckoutNotificationMessage,
} from '../external/lineMessaging.js';

export const createCheckout = async (jobId, items, userId) => {
    const job = await prisma.job.findUnique({
        where: { id: parseInt(jobId, 10) },

    });

    if (!job) {
        throw new Error('ไม่พบงานที่ต้องการ');
    }

    if (job.status !== 'PENDING') {
        throw new Error('งานไม่อยู่ในสถานะที่สามารถเช็คของออกได้');
    }

    return await prisma.$transaction(async (prismaClient) => {
        const checkout = await prismaClient.checkout.create({
            data: {
                jobId: parseInt(jobId, 10),
                userId: userId,
                createdBy: userId,
                items: {
                    create: items.map(item => ({
                        itemId: parseInt(item.itemId, 10),
                        quantity: parseInt(item.quantity, 10),
                        actualQuantity: parseInt(item.actualQuantity, 10)
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
            data: { status: 'IN_PROGRESS' }
        });

        for (const item of items) {
            const itemData = await prismaClient.item.findUnique({
                where: { id: parseInt(item.itemId, 10) }
            });

            if (itemData) {
                await prismaClient.item.update({
                    where: { id: parseInt(item.itemId, 10) },
                    data: { stock: itemData.stock - parseInt(item.actualQuantity, 10) }
                });
            }
        }

        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        })

        await logAction({
            action: 'CHECKOUT',
            userId,
            jobId: parseInt(jobId, 10),
            targetType: 'Checkout',
            targetId: checkout.id,
            details: {
                jobTitle: job.title,
                jobLocation: job.location,
                itemCount: items.length,
                message: `เช็คของออกสำหรับงาน "${job.title}" จำนวน ${items.length} รายการ`,
                checkoutBy: user?.name || 'ไม่ระบุ',
                items: checkout.items.map(item => ({
                    name: item.item.name,
                    quantity: item.quantity,
                    actualQuantity: item.actualQuantity,
                    unit: item.item.Unit?.name || 'หน่วย',
                }))
            }
        });

        try {
            const notificationMessage = createCheckoutNotificationMessage(
                checkout,
                job,
                user || { name: 'ไม่ระบุ' },
                checkout.items
            );

            await sendLineGroupMessage(process.env.LINE_GROUP_ID, notificationMessage);
        } catch (error) {
            console.error('Failed to send LINE notification:', error);
        }

        return checkout;
    });
};

export const getCheckoutsByJobId = async (jobId) => {
    return await prisma.checkout.findMany({
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

export const getCheckoutById = async (id) => {
    return await prisma.checkout.findUnique({
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