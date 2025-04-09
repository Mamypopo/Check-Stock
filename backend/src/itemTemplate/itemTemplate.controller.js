import * as itemTemplateService from './itemTemplate.service.js';

export const getAllItemTemplates = async (req, res) => {
    try {
        const templates = await itemTemplateService.getAllItemTemplates();
        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching item templates:', error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเทมเพลตได้' });
    }
};

export const getItemTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'รหัสเทมเพลตต้องเป็นตัวเลข' });
        }

        const template = await itemTemplateService.getItemTemplateById(parsedId);

        if (!template) {
            return res.status(404).json({ error: 'ไม่พบเทมเพลตที่ต้องการ' });
        }

        res.status(200).json(template);
    } catch (error) {
        console.error('Error fetching item template:', error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลเทมเพลตได้' });
    }
};

export const createItemTemplate = async (req, res) => {
    try {
        const { name, items } = req.body;
        const userId = req.user.userId;

        if (!name || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'กรุณาระบุชื่อเทมเพลตและรายการสิ่งของอย่างน้อย 1 รายการ' });
        }

        for (const item of items) {
            if (!item.itemId || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ error: 'ข้อมูลรายการสิ่งของไม่ถูกต้อง' });
            }
        }

        const template = await itemTemplateService.createItemTemplate(name, items, userId);
        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating item template:', error);
        res.status(500).json({ error: 'ไม่สามารถสร้างเทมเพลตได้' });
    }
};

export const updateItemTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, items } = req.body;
        const userId = req.user.userId;
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'รหัสเทมเพลตต้องเป็นตัวเลข' });
        }

        if (!name || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'กรุณาระบุชื่อเทมเพลตและรายการสิ่งของอย่างน้อย 1 รายการ' });
        }

        // ตรวจสอบข้อมูลรายการสิ่งของ
        for (const item of items) {
            if (!item.itemId || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ error: 'ข้อมูลรายการสิ่งของไม่ถูกต้อง' });
            }
        }

        const template = await itemTemplateService.updateItemTemplate(parsedId, name, items, userId);
        res.status(200).json(template);
    } catch (error) {
        console.error('Error updating item template:', error);
        res.status(500).json({ error: 'ไม่สามารถแก้ไขเทมเพลตได้' });
    }
};

export const deleteItemTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'รหัสเทมเพลตต้องเป็นตัวเลข' });
        }

        await itemTemplateService.deleteItemTemplate(parsedId, userId);
        res.status(200).json({ message: 'ลบเทมเพลตสำเร็จ' });
    } catch (error) {
        console.error('Error deleting item template:', error);

        if (error.message === 'ไม่พบเทมเพลตที่ต้องการลบ') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'ไม่สามารถลบเทมเพลตได้' });
    }
}; 