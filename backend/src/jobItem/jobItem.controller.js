import * as jobItemService from './jobItem.service.js'

export const getJobItems = async (req, res) => {
    try {
        const { jobId } = req.params;
        const parsedJobId = parseInt(jobId, 10);

        if (isNaN(parsedJobId)) {
            return res.status(400).json({ error: 'รหัสงานต้องเป็นตัวเลข' });
        }

        const jobItems = await jobItemService.getJobItems(parsedJobId);

        res.status(200).json(jobItems);
    } catch (error) {
        console.error('Error fetching job items:', error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลรายการสิ่งของได้' });
    }
};

export const addJobItem = async (req, res) => {
    try {
        const { jobId, itemId, quantity } = req.body;
        const userId = req.user.userId;
        if (!jobId || !itemId || !quantity) {
            return res.status(400).json({ error: 'กรุณาระบุข้อมูลให้ครบถ้วน' });
        }

        const jobItem = await jobItemService.addJobItem(
            parseInt(jobId, 10),
            parseInt(itemId, 10),
            parseInt(quantity, 10),
            userId
        );

        res.status(201).json(jobItem);
    } catch (error) {
        console.error('Error adding job item:', error);

        if (error.message === 'ไม่พบงานที่ต้องการ' || error.message === 'ไม่พบสิ่งของที่ต้องการ') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'ไม่สามารถเพิ่มสิ่งของในงานได้' });
    }
};

export const updateJobItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user.userId;
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'รหัสรายการต้องเป็นตัวเลข' });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: 'จำนวนต้องมากกว่า 0' });
        }

        const jobItem = await jobItemService.updateJobItem(parsedId, quantity, userId);

        res.status(200).json(jobItem);
    } catch (error) {
        console.error('Error updating job item:', error);
        res.status(500).json({ error: 'ไม่สามารถแก้ไขสิ่งของในงานได้' });
    }
};

export const deleteJobItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'รหัสรายการต้องเป็นตัวเลข' });
        }

        await jobItemService.deleteJobItem(parsedId, userId);

        res.status(200).json({ message: 'ลบสิ่งของในงานสำเร็จ' });
    } catch (error) {
        console.error('Error deleting job item:', error);
        res.status(500).json({ error: 'ไม่สามารถลบสิ่งของในงานได้' });
    }
};

export const addItemsFromTemplate = async (req, res) => {
    try {
        const { jobId, templateId } = req.body;
        const userId = req.user.userId;

        if (!jobId || !templateId) {
            return res.status(400).json({ error: 'กรุณาระบุรหัสงานและรหัสเทมเพลต' });
        }

        const jobItems = await jobItemService.addItemsFromTemplate(
            parseInt(jobId, 10),
            parseInt(templateId, 10),
            userId
        );

        res.status(201).json(jobItems);
    } catch (error) {
        console.error('Error adding items from template:', error);

        if (error.message === 'ไม่พบงานที่ต้องการ' || error.message === 'ไม่พบเทมเพลตที่ต้องการ') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'ไม่สามารถเพิ่มรายการสิ่งของจากเทมเพลตได้' });
    }
}; 