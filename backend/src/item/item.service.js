import prisma from '../config/database.js'
import { logAction } from '../utils/logger.js'

export const getAllItems = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const totalItems = await prisma.item.count({
        where: { isDelete: false }
    });

    const items = await prisma.item.findMany({
        where: { isDelete: false },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit,
        select: {
            id: true,
            name: true,
            code: true,
            stock: true,
            description: true,
            isConsumable: true,
            createdBy: true,
            updatedBy: true,
            createdAt: true,
            updatedAt: true,
            category: true,
            Unit: true,
            createdByUser: true,
            updatedByUser: true,
            jobItems: true,
            checkouts: true,
            checkins: true,
        }
    });

    return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page
    };
}

export const createItem = async (data, userId) => {

    if (data.code) {
        const normalizedCode = data.code.replace(/\s+/g, '').toLowerCase();
        const existingItems = await prisma.item.findMany({
            where: {
                isDelete: false
            }
        });
        const duplicate = existingItems.find(item =>
            item.code && item.code.replace(/\s+/g, '').toLowerCase() === normalizedCode
        );

        if (duplicate) {
            throw new Error('รหัสสินค้านี้มีอยู่ในระบบแล้ว');
        }
    }

    const newItem = await prisma.item.create({
        data: {
            name: data.name,
            code: data.code ? data.code.trim() : null,
            stock: data.stock,
            description: data.description,
            categoryId: data.categoryId,
            unitId: data.unitId,
            isConsumable: data.isConsumable,
            createdBy: userId || data.createdBy,
        },
        include: {
            category: true,
            Unit: true
        }
    });

    await logAction({
        action: 'CREATE_ITEM',
        userId,
        targetType: 'Item',
        targetId: newItem.id,
        details: {
            name: newItem.name,
            code: newItem.code,
            stock: newItem.stock,
            category: newItem.category?.name,
            unit: newItem.Unit?.name,
            isConsumable: newItem.isConsumable,
        }
    });

    return newItem;
}

export const updateItem = async (id, data, userId) => {
    const existingItem = await prisma.item.findUnique({
        where: { id: parseInt(id) },
        include: {
            category: true,
            Unit: true
        }
    });

    if (!existingItem) {
        throw new Error('ไม่พบสิ่งของที่ต้องการแก้ไข');
    }

    if (data.code && (!existingItem.code ||
        data.code.replace(/\s+/g, '').toLowerCase() !== existingItem.code.replace(/\s+/g, '').toLowerCase())) {
        const normalizedCode = data.code.replace(/\s+/g, '').toLowerCase();
        const existingItems = await prisma.item.findMany({
            where: {
                isDelete: false,
                id: { not: parseInt(id) }
            }
        });
        const duplicate = existingItems.find(item =>
            item.code && item.code.replace(/\s+/g, '').toLowerCase() === normalizedCode
        );

        if (duplicate) {
            throw new Error('รหัสสินค้านี้มีอยู่ในระบบแล้ว');
        }
    }


    const updatedItem = await prisma.item.update({
        where: { id: parseInt(id) },
        data: {
            name: data.name,
            code: data.code ? data.code.trim() : null,
            stock: data.stock,
            description: data.description,
            categoryId: data.categoryId,
            unitId: data.unitId,
            ...data,
            updatedBy: userId || data.userId,
        },
        include: {
            category: true,
            Unit: true
        }
    });

    await logAction({
        action: 'UPDATE_ITEM',
        userId,
        targetType: 'Item',
        targetId: updatedItem.id,
        details: {
            oldName: existingItem.name,
            newName: updatedItem.name,
            oldCode: existingItem.code,
            newCode: updatedItem.code,
            oldStock: existingItem.stock,
            newStock: updatedItem.stock,
            oldCategory: existingItem.category?.name,
            newCategory: updatedItem.category?.name,
            oldUnit: existingItem.Unit?.name,
            newUnit: updatedItem.Unit?.name,
            message: `แก้ไขสิ่งของ: ${existingItem.name} (${existingItem.code}) เป็น ${updatedItem.name} (${updatedItem.code})`
        }
    });

    return updatedItem;
}

export const deleteItem = async (id, userId) => {
    const item = await prisma.item.findUnique({
        where: { id: parseInt(id) },
        include: {
            category: true,
            Unit: true
        }
    });

    if (!item) {
        throw new Error('ไม่พบสิ่งของที่ต้องการลบ');
    }

    const result = await prisma.item.update({
        where: { id: parseInt(id) },
        data: {
            isDelete: true,
            deletedAt: new Date(),
        }
    });

    await logAction({
        action: 'DELETE_ITEM',
        userId,
        targetType: 'Item',
        targetId: parseInt(id),
        details: {
            name: item.name,
            code: item.code,
            stock: item.stock,
            category: item.category?.name,
            unit: item.Unit?.name,
            message: `ลบสิ่งของ: ${item.name} (${item.code})`
        }
    });

    return result;
}

export const createCategory = async (data, userId) => {
    const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
    })

    if (existingCategory) {
        const error = new Error()
        error.existing = existingCategory
        throw error
    }

    const newCategory = await prisma.category.create({
        data: {
            name: data.name,
            createdBy: userId,
        }
    });

    await logAction({
        action: 'CREATE_CATEGORY',
        userId,
        targetType: 'Category',
        targetId: newCategory.id,
        details: {
            name: newCategory.name,
            message: `สร้างหมวดหมู่ใหม่: ${newCategory.name}`
        }
    });

    return newCategory;
}

export const getCategories = async () => {
    return await prisma.category.findMany({
        where: {
            isDelete: false
        },
        orderBy: {
            name: 'asc'
        }
    });
}

export const updateCategory = async (id, data, userId) => {
    const existingCategory = await prisma.category.findUnique({
        where: { id: parseInt(id) }
    });

    if (!existingCategory) {
        throw new Error('ไม่พบหมวดหมู่ที่ต้องการแก้ไข');
    }

    const updatedCategory = await prisma.category.update({
        where: { id: parseInt(id) },
        data: {
            name: data.name,
        }
    });

    await logAction({
        action: 'UPDATE_CATEGORY',
        userId,
        targetType: 'Category',
        targetId: updatedCategory.id,
        details: {
            oldName: existingCategory.name,
            newName: updatedCategory.name,
            message: `แก้ไขหมวดหมู่: ${existingCategory.name} เป็น ${updatedCategory.name}`
        }
    });

    return updatedCategory;
}

export const deleteCategory = async (id, userId) => {
    const category = await prisma.category.findUnique({
        where: { id: parseInt(id) }
    });

    if (!category) {
        throw new Error('ไม่พบหมวดหมู่ที่ต้องการลบ');
    }

    const result = await prisma.category.update({
        where: { id: parseInt(id) },
        data: {
            isDelete: true,
            updatedAt: new Date()
        }
    });

    await logAction({
        action: 'DELETE_CATEGORY',
        userId,
        targetType: 'Category',
        targetId: parseInt(id),
        details: {
            name: category.name,
            message: `ลบหมวดหมู่: ${category.name}`
        }
    });

    return result;
}

export const createUnit = async (data, userId) => {
    const existingUnit = await prisma.unit.findUnique({
        where: { name: data.name },
    });

    if (existingUnit) {
        const error = new Error()
        error.existing = existingUnit
        throw error
    }

    const newUnit = await prisma.unit.create({
        data: {
            name: data.name,
            createdBy: userId,
        }
    });

    await logAction({
        action: 'CREATE_UNIT',
        userId,
        targetType: 'Unit',
        targetId: newUnit.id,
        details: {
            name: newUnit.name,
            message: `สร้างหน่วยนับใหม่: ${newUnit.name}`
        }
    });

    return newUnit;
}

export const getUnits = async () => {
    return await prisma.unit.findMany({
        where: {
            isDelete: false
        },
        orderBy: {
            name: 'asc'
        }
    });
}

export const updateUnit = async (id, data, userId) => {
    const existingUnit = await prisma.unit.findUnique({
        where: { id: parseInt(id) }
    });

    if (!existingUnit) {
        throw new Error('ไม่พบหน่วยนับที่ต้องการแก้ไข');
    }

    const updatedUnit = await prisma.unit.update({
        where: { id: parseInt(id) },
        data: {
            name: data.name,
        }
    });

    await logAction({
        action: 'UPDATE_UNIT',
        userId,
        targetType: 'Unit',
        targetId: updatedUnit.id,
        details: {
            oldName: existingUnit.name,
            newName: updatedUnit.name,
            message: `แก้ไขหน่วยนับ: ${existingUnit.name} เป็น ${updatedUnit.name}`
        }
    });

    return updatedUnit;
}

export const deleteUnit = async (id, userId) => {
    const unit = await prisma.unit.findUnique({
        where: { id: parseInt(id) }
    });

    if (!unit) {
        throw new Error('ไม่พบหน่วยนับที่ต้องการลบ');
    }

    const result = await prisma.unit.update({
        where: { id: parseInt(id) },
        data: {
            isDelete: true,
            updatedAt: new Date()
        }
    });

    await logAction({
        action: 'DELETE_UNIT',
        userId,
        targetType: 'Unit',
        targetId: parseInt(id),
        details: {
            name: unit.name,
            message: `ลบหน่วยนับ: ${unit.name}`
        }
    });

    return result;
}

export const searchItems = async (query = '', categoryId, isConsumable, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const where = {
        isDelete: false,
        ...(query ? {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { name: { contains: query, mode: 'insensitive' } } },
                { Unit: { name: { contains: query, mode: 'insensitive' } } },
            ]
        } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(isConsumable !== undefined ? { isConsumable } : {}),
    };

    const totalItems = await prisma.item.count({ where });

    const items = await prisma.item.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
            id: true,
            name: true,
            code: true,
            stock: true,
            description: true,
            isConsumable: true,
            createdBy: true,
            updatedBy: true,
            createdAt: true,
            updatedAt: true,
            category: true,
            Unit: true,
            createdByUser: true,
            updatedByUser: true,
            jobItems: true,
            checkouts: true,
            checkins: true,
        }
    });

    return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page
    };
};

export const searchItemsForDropdown = async (query) => {
    const whereCondition = {
        isDelete: false,
    };

    if (query) {
        whereCondition.OR = [
            { code: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
        ];
    }

    return await prisma.item.findMany({
        where: whereCondition,
        include: {
            category: true,
            Unit: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 100,
    });
};
