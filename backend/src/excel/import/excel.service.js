import prisma from '../../config/database.js'
import { logAction } from '../../utils/logger.js'

export const importItemsFromExcel = async (items, userId) => {
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    const categoryNames = new Set();
    const unitNames = new Set();

    const validItems = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
            const { name, categoryName, unitName, stock } = item;

            if (!name || !categoryName || !unitName || !stock) {
                const missingFields = [];
                if (!name) missingFields.push('ชื่อสินทรัพย์');
                if (!categoryName) missingFields.push('หมวดหมู่');
                if (!unitName) missingFields.push('หน่วย');
                if (!stock) missingFields.push('จำนวน');

                errors.push({
                    item,
                    reason: `ข้อมูลไม่ครบถ้วน: ${missingFields.join(', ')}`,
                    rowNumber: i + 2,
                    missingFields: missingFields
                });
                errorCount++;
                continue;
            }

            const stockNumber = parseInt(stock, 10);
            if (isNaN(stockNumber) || stockNumber < 0) {
                errors.push({
                    item,
                    reason: 'จำนวนต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0',
                    rowNumber: i + 2
                });
                errorCount++;
                continue;
            }

            categoryNames.add(categoryName);
            unitNames.add(unitName);

            validItems.push({
                ...item,
                stock: stockNumber
            });
        } catch (error) {
            console.error('Error validating item:', error);
            errors.push({
                item,
                reason: `เกิดข้อผิดพลาด: ${error.message}`,
                rowNumber: i + 2
            });
            errorCount++;
        }
    }

    if (validItems.length === 0) {
        return {
            created: 0,
            skipped: 0,
            errors: errorCount,
            errorDetails: errors
        };
    }

    const categories = await Promise.all(
        Array.from(categoryNames).map(async (name) => {
            return await prisma.category.upsert({
                where: { name },
                update: {},
                create: {
                    name,
                }
            });
        })
    );

    const categoryMap = {};
    categories.forEach(category => {
        categoryMap[category.name] = category.id;
    });

    const units = await Promise.all(
        Array.from(unitNames).map(async (name) => {
            return await prisma.unit.upsert({
                where: { name },
                update: {},
                create: {
                    name,
                }
            });
        })
    );

    const unitMap = {};
    units.forEach(unit => {
        unitMap[unit.name] = unit.id;
    });

    const existingItems = await prisma.item.findMany({
        where: {
            OR: [
                {
                    code: {
                        in: validItems
                            .filter(item => item.code)
                            .map(item => item.code)
                    },
                    isDelete: false
                },
                {
                    name: {
                        in: validItems.map(item => item.name)
                    },
                    isDelete: false
                }
            ]
        },
        select: {
            id: true,
            name: true,
            code: true,
            categoryId: true,
            unitId: true
        }
    });

    const existingItemMap = {};
    existingItems.forEach(item => {
        if (item.code) {
            existingItemMap[item.code] = item;
        } else {
            existingItemMap[item.name] = item;
        }
    });

    const createData = [];

    for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        const { code, name, categoryName, unitName, stock } = item;

        const existing = existingItemMap[code] || existingItemMap[name];

        if (existing) {
            skippedCount++;
            errors.push({
                item,
                reason: `รายการนี้มีอยู่แล้วในระบบ`,
                rowNumber: items.findIndex(originalItem =>
                    originalItem.code === code || originalItem.name === name
                ) + 2,
                type: 'skipped'
            });
            continue;
        }

        createData.push({
            code,
            name,
            categoryId: categoryMap[categoryName],
            unitId: unitMap[unitName],
            stock,
            createdBy: userId
        });
    }

    if (createData.length > 0) {
        try {
            const createdItems = await prisma.item.createMany({
                data: createData
            });
            createdCount = createdItems.count;

            await logAction({
                action: 'IMPORT_ITEMS',
                userId,
                targetType: 'item',
                details: JSON.stringify({
                    created: createdCount,
                    skipped: skippedCount,
                    errors: errorCount,
                    errorDetails: errors.length > 0 ? errors.map(err => ({
                        rowNumber: err.rowNumber,
                        reason: err.reason,
                        itemName: err.item?.name || '-',
                        itemCode: err.item?.code || '-'
                    })) : []
                })
            });
        } catch (error) {
            console.error('Error creating items:', error);
            errors.push({
                reason: `เกิดข้อผิดพลาดในการสร้างสินทรัพย์: ${error.message}`
            });
            errorCount++;
        }
    }

    return {
        created: createdCount,
        skipped: skippedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined
    };
};
