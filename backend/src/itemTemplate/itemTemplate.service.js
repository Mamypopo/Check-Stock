import prisma from '../config/database.js';
import { logAction } from '../utils/logger.js';

export const getAllItemTemplates = async () => {
    return await prisma.itemTemplate.findMany({
        orderBy: { name: 'asc' },
        include: {
            items: true
        }
    });
};

export const getItemTemplateById = async (id) => {
    return await prisma.itemTemplate.findUnique({
        where: { id: parseInt(id, 10) },
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
};

export const createItemTemplate = async (name, items, userId) => {
    return await prisma.$transaction(async (prismaClient) => {
        const template = await prismaClient.itemTemplate.create({
            data: {
                name
            }
        });

        const itemsWithDetails = [];

        for (const item of items) {
            const itemId = parseInt(item.itemId, 10);
            const quantity = parseInt(item.quantity, 10);

            const itemDetails = await prismaClient.item.findUnique({
                where: { id: itemId },
                select: { id: true, name: true, code: true }
            });

            await prismaClient.itemTemplateItem.create({
                data: {
                    templateId: template.id,
                    itemId,
                    quantity
                }
            });

            itemsWithDetails.push({
                itemId,
                quantity,
                name: itemDetails?.name || 'ไม่ระบุชื่อ',
                code: itemDetails?.code || '-'
            });
        }

        await logAction({
            action: 'CREATE_ITEM_TEMPLATE',
            userId,
            targetType: 'ItemTemplate',
            targetId: template.id,
            details: {
                templateName: name,
                itemCount: items.length,
                items: itemsWithDetails,
                message: `สร้างเทมเพลต "${name}" จำนวน ${items.length} รายการ`
            }
        });

        return await prismaClient.itemTemplate.findUnique({
            where: { id: template.id },
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
    });
};

export const updateItemTemplate = async (id, name, items, userId) => {
    const templateId = parseInt(id, 10);

    return await prisma.$transaction(async (prismaClient) => {
        const template = await prismaClient.itemTemplate.update({
            where: { id: templateId },
            data: { name }
        });

        await prismaClient.itemTemplateItem.deleteMany({
            where: { templateId }
        });

        const itemsWithDetails = [];

        for (const item of items) {
            const itemId = parseInt(item.itemId, 10);
            const quantity = parseInt(item.quantity, 10);

            const itemDetails = await prismaClient.item.findUnique({
                where: { id: itemId },
                select: { id: true, name: true, code: true }
            });

            await prismaClient.itemTemplateItem.create({
                data: {
                    templateId,
                    itemId,
                    quantity
                }
            });

            itemsWithDetails.push({
                itemId,
                quantity,
                name: itemDetails?.name || 'ไม่ระบุชื่อ',
                code: itemDetails?.code || '-'
            });
        }

        await logAction({
            action: 'UPDATE_ITEM_TEMPLATE',
            userId,
            targetType: 'ItemTemplate',
            targetId: templateId,
            details: {
                templateName: name,
                itemCount: items.length,
                items: itemsWithDetails,
                message: `แก้ไขเทมเพลต "${name}" จำนวน ${items.length} รายการ`
            }
        });

        return await prismaClient.itemTemplate.findUnique({
            where: { id: templateId },
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
    });
};

export const deleteItemTemplate = async (id, userId) => {
    const templateId = parseInt(id, 10);

    return await prisma.$transaction(async (prismaClient) => {
        const template = await prismaClient.itemTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            throw new Error('ไม่พบเทมเพลตที่ต้องการลบ');
        }

        await prismaClient.itemTemplateItem.deleteMany({
            where: { templateId }
        });

        await prismaClient.itemTemplate.delete({
            where: { id: templateId }
        });

        await logAction({
            action: 'DELETE_ITEM_TEMPLATE',
            userId,
            targetType: 'ItemTemplate',
            targetId: templateId,
            details: {
                templateName: template.name,
                message: `ลบเทมเพลต "${template.name}"`
            }
        });

        return template;
    });
}; 