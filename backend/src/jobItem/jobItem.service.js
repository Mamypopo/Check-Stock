import prisma from '../config/database.js'
import { logAction } from '../utils/logger.js'

export const getJobItems = async (jobId) => {
    return await prisma.jobItem.findMany({
        where: { jobId },
        include: {
            item: {
                include: {
                    category: true,
                    Unit: true
                }
            }
        }
    });
};

export const addJobItem = async (jobId, itemId, quantity, userId) => {
    const job = await prisma.job.findUnique({
        where: { id: jobId }
    });

    if (!job) {
        throw new Error('ไม่พบงานที่ต้องการ');
    }

    const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: {
            category: true,
            Unit: true
        }
    });

    if (!item) {
        throw new Error('ไม่พบสิ่งของที่ต้องการ');
    }

    // if (item.stock < quantity) {
    //     throw new Error('จำนวนสิ่งของในคลังไม่เพียงพอ');
    // }

    const existingJobItem = await prisma.jobItem.findFirst({
        where: {
            jobId,
            itemId
        }
    });

    return await prisma.$transaction(async (prismaClient) => {
        let result;

        if (existingJobItem) {
            const newQuantity = existingJobItem.quantity + quantity;
            result = await prismaClient.jobItem.update({
                where: { id: existingJobItem.id },
                data: { quantity: newQuantity }
            });

            await logAction({
                action: 'UPDATE_JOB_ITEM',
                userId,
                jobId,
                targetType: 'JobItem',
                targetId: existingJobItem.id,
                details: {
                    itemName: item.name,
                    itemCode: item.code,
                    category: item.category?.name,
                    unit: item.Unit?.name,
                    oldQuantity: existingJobItem.quantity,
                    newQuantity,
                    message: `เพิ่มจำนวน ${item.name} ในงาน ${job.title} จาก ${existingJobItem.quantity} เป็น ${newQuantity}`
                }
            });
        } else {
            result = await prismaClient.jobItem.create({
                data: {
                    jobId,
                    itemId,
                    quantity
                }
            });

            await logAction({
                action: 'ADD_JOB_ITEM',
                userId,
                jobId,
                targetType: 'JobItem',
                targetId: result.id,
                details: {
                    itemName: item.name,
                    itemCode: item.code,
                    category: item.category?.name,
                    unit: item.Unit?.name,
                    quantity,
                    message: `เพิ่ม ${item.name} จำนวน ${quantity} ${item.Unit?.name || 'หน่วย'} ในงาน ${job.title}`
                }
            });
        }

        return result;
    });
};

export const updateJobItem = async (id, quantity, userId) => {
    const existingJobItem = await prisma.jobItem.findUnique({
        where: { id },
        include: {
            job: true,
            item: {
                include: {
                    category: true,
                    Unit: true
                }
            }
        }
    });

    if (!existingJobItem) {
        throw new Error('ไม่พบรายการสิ่งของที่ต้องการแก้ไข');
    }

    // const quantityDiff = quantity - existingJobItem.quantity;
    // if (quantityDiff > 0 && existingJobItem.item.stock < quantityDiff) {
    //     throw new Error('จำนวนสิ่งของในคลังไม่เพียงพอ');
    // }

    return await prisma.$transaction(async (prismaClient) => {
        const updatedJobItem = await prismaClient.jobItem.update({
            where: { id },
            data: { quantity }
        });

        await logAction({
            action: 'UPDATE_JOB_ITEM',
            userId,
            jobId: existingJobItem.jobId,
            targetType: 'JobItem',
            targetId: id,
            details: {
                itemName: existingJobItem.item.name,
                itemCode: existingJobItem.item.code,
                category: existingJobItem.item.category?.name,
                unit: existingJobItem.item.Unit?.name,
                oldQuantity: existingJobItem.quantity,
                newQuantity: quantity,
                message: `แก้ไขจำนวน ${existingJobItem.item.name} ในงาน ${existingJobItem.job.title} จาก ${existingJobItem.quantity} เป็น ${quantity}`
            }
        });

        return updatedJobItem;
    });
};

export const deleteJobItem = async (id, userId) => {
    const jobItem = await prisma.jobItem.findUnique({
        where: { id },
        include: {
            job: true,
            item: {
                include: {
                    category: true,
                    Unit: true
                }
            }
        }
    });

    if (!jobItem) {
        throw new Error('ไม่พบรายการสิ่งของที่ต้องการลบ');
    }

    return await prisma.$transaction(async (prismaClient) => {
        const result = await prismaClient.jobItem.delete({
            where: { id }
        });

        await logAction({
            action: 'DELETE_JOB_ITEM',
            userId,
            jobId: jobItem.jobId,
            targetType: 'JobItem',
            targetId: id,
            details: {
                itemName: jobItem.item.name,
                itemCode: jobItem.item.code,
                category: jobItem.item.category?.name,
                unit: jobItem.item.Unit?.name,
                quantity: jobItem.quantity,
                message: `ลบ ${jobItem.item.name} จำนวน ${jobItem.quantity} ${jobItem.item.Unit?.name || 'หน่วย'} ออกจากงาน ${jobItem.job.title}`
            }
        });

        return result;
    });
};

export const addItemsFromTemplate = async (jobId, templateId, userId) => {
    const job = await prisma.job.findUnique({
        where: { id: parseInt(jobId, 10) }
    });

    if (!job) {
        throw new Error('ไม่พบงานที่ต้องการ');
    }

    const template = await prisma.itemTemplate.findUnique({
        where: { id: parseInt(templateId, 10) },
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
            }
        }
    });

    if (!template) {
        throw new Error('ไม่พบเทมเพลตที่ต้องการ');
    }

    return await prisma.$transaction(async (prismaClient) => {
        const results = [];

        for (const templateItem of template.items) {
            const item = templateItem.item;
            const quantity = templateItem.quantity;

            // ตรวจสอบว่ามีรายการนี้ในงานแล้วหรือไม่
            const existingJobItem = await prismaClient.jobItem.findFirst({
                where: {
                    jobId: parseInt(jobId, 10),
                    itemId: item.id
                }
            });

            let result;

            if (existingJobItem) {
                // ถ้ามีแล้ว ให้อัพเดทจำนวน
                const newQuantity = existingJobItem.quantity + quantity;
                result = await prismaClient.jobItem.update({
                    where: { id: existingJobItem.id },
                    data: { quantity: newQuantity },
                    include: {
                        item: {
                            include: {
                                category: true,
                                Unit: true
                            }
                        }
                    }
                });

                await logAction({
                    action: 'UPDATE_JOB_ITEM',
                    userId,
                    jobId: parseInt(jobId, 10),
                    targetType: 'JobItem',
                    targetId: existingJobItem.id,
                    details: {
                        itemName: item.name,
                        itemCode: item.code,
                        category: item.category?.name,
                        unit: item.Unit?.name,
                        oldQuantity: existingJobItem.quantity,
                        newQuantity,
                        message: `เพิ่มจำนวน ${item.name} ในงาน ${job.title} จาก ${existingJobItem.quantity} เป็น ${newQuantity} (จากเทมเพลต ${template.name})`
                    }
                });
            } else {
                // ถ้ายังไม่มี ให้สร้างใหม่
                result = await prismaClient.jobItem.create({
                    data: {
                        jobId: parseInt(jobId, 10),
                        itemId: item.id,
                        quantity
                    },
                    include: {
                        item: {
                            include: {
                                category: true,
                                Unit: true
                            }
                        }
                    }
                });

                await logAction({
                    action: 'ADD_JOB_ITEM',
                    userId,
                    jobId: parseInt(jobId, 10),
                    targetType: 'JobItem',
                    targetId: result.id,
                    details: {
                        itemName: item.name,
                        itemCode: item.code,
                        category: item.category?.name,
                        unit: item.Unit?.name,
                        quantity,
                        message: `เพิ่ม ${item.name} จำนวน ${quantity} ${item.Unit?.name || 'หน่วย'} ในงาน ${job.title} (จากเทมเพลต ${template.name})`
                    }
                });
            }

            results.push(result);
        }

        await logAction({
            action: 'APPLY_TEMPLATE',
            userId,
            jobId: parseInt(jobId, 10),
            targetType: 'ItemTemplate',
            targetId: template.id,
            details: {
                templateName: template.name,
                itemCount: template.items.length,
                message: `นำเทมเพลต ${template.name} มาใช้กับงาน ${job.title} (${template.items.length} รายการ)`
            }
        });

        return results;
    });
}; 