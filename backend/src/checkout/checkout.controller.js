import * as checkoutService from './checkout.service.js';

export const createCheckout = async (req, res) => {
    try {
        const { jobId, items } = req.body;
        const userId = req.user.userId;

        if (!jobId || !items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'กรุณาระบุข้อมูลให้ครบถ้วน' });
        }

        const checkout = await checkoutService.createCheckout(jobId, items, userId);
        res.status(201).json(checkout);
    } catch (error) {
        console.error('Error creating checkout:', error);

        if (error.message === 'ไม่พบงานที่ต้องการ' || error.message === 'งานไม่อยู่ในสถานะที่สามารถเช็คของออกได้') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'ไม่สามารถสร้างรายการเช็คของออกได้' });
    }
};

export const getCheckoutsByJobId = async (req, res) => {
    try {
        const { jobId } = req.params;
        const parsedJobId = parseInt(jobId, 10);

        if (isNaN(parsedJobId)) {
            return res.status(400).json({ error: 'รหัสงานต้องเป็นตัวเลข' });
        }

        const checkouts = await checkoutService.getCheckoutsByJobId(parsedJobId);
        res.status(200).json(checkouts);
    } catch (error) {
        console.error('Error fetching checkouts:', error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลรายการเช็คของออกได้' });
    }
};

export const getCheckoutById = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId)) {
            return res.status(400).json({ error: 'รหัสรายการต้องเป็นตัวเลข' });
        }

        const checkout = await checkoutService.getCheckoutById(parsedId);

        if (!checkout) {
            return res.status(404).json({ error: 'ไม่พบรายการเช็คของออกที่ต้องการ' });
        }

        res.status(200).json(checkout);
    } catch (error) {
        console.error('Error fetching checkout:', error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลรายการเช็คของออกได้' });
    }
}; 