import * as checkinService from './checkin.service.js';

export const createCheckin = async (req, res) => {
    try {
        const { jobId, checkoutId, items } = req.body;
        const userId = req.user.userId;

        if (!jobId || !items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'กรุณาระบุข้อมูลให้ครบถ้วน' });
        }

        const checkin = await checkinService.createCheckin(jobId, checkoutId, items, userId);
        res.status(201).json(checkin);
    } catch (error) {
        console.error('Error creating checkin:', error);

        if (error.message === 'ไม่พบงานที่ต้องการ' || error.message === 'งานไม่อยู่ในสถานะที่สามารถเช็คของเข้าได้') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'ไม่สามารถสร้างรายการเช็คของเข้าได้' });
    }
};

export const getCheckinsByJobId = async (req, res) => {
    try {
        const { jobId } = req.params;
        const parsedJobId = parseInt(jobId, 10);

        if (isNaN(parsedJobId)) {
            return res.status(400).json({ error: 'รหัสงานต้องเป็นตัวเลข' });
        }

        const checkins = await checkinService.getCheckinsByJobId(parsedJobId);
        res.status(200).json(checkins);
    } catch (error) {
        console.error('Error fetching checkins:', error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลรายการเช็คของเข้าได้' });
    }
};

export const getCheckinById = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'รหัสรายการต้องเป็นตัวเลข' });
        }

        const checkin = await checkinService.getCheckinById(parsedId);

        if (!checkin) {
            return res.status(404).json({ error: 'ไม่พบรายการเช็คของเข้าที่ต้องการ' });
        }

        res.status(200).json(checkin);
    } catch (error) {
        console.error('Error fetching checkin:', error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลรายการเช็คของเข้าได้' });
    }
}; 