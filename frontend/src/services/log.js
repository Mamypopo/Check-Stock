import api from './api.js'

export default {
    /**
     * ดึงรายการ logs ทั้งหมด
     * @param {Object} params - พารามิเตอร์สำหรับการกรอง
     * @param {number} params.page - หน้าที่ต้องการ
     * @param {number} params.limit - จำนวนรายการต่อหน้า
     * @param {string} params.action - ประเภทการทำงาน (login, logout, create, update, delete)
     * @param {string} params.startDate - วันที่เริ่มต้น (YYYY-MM-DD)
     * @param {string} params.endDate - วันที่สิ้นสุด (YYYY-MM-DD)
     * @param {string} params.userId - ID ของผู้ใช้
     * @param {string} params.targetType - ประเภทของเป้าหมาย (user, item, job, category, unit)
     * @param {string} params.targetId - ID ของเป้าหมาย
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูล logs
     */
    getLogs(params = {}) {
        return api.get('/logs', { params })
    },

    /**
     * ดึงรายละเอียด log ตาม ID
     * @param {number} id - ID ของ log
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูล log
     */
    getLogById(id) {
        return api.get(`/logs/${id}`)
    },

    /**
     * สร้าง log ใหม่ (สำหรับการทดสอบหรือใช้จาก frontend โดยตรง)
     * @param {Object} data - ข้อมูล log
     * @param {string} data.action - ประเภทการทำงาน (login, logout, create, update, delete)
     * @param {string} data.userId - ID ของผู้ใช้
     * @param {string} data.jobId - ID ของงาน (ถ้ามี)
     * @param {string} data.targetType - ประเภทของเป้าหมาย (user, item, job, category, unit)
     * @param {string} data.targetId - ID ของเป้าหมาย
     * @param {Object} data.details - รายละเอียดเพิ่มเติม
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูล log ที่สร้าง
     */
    createLog(data) {
        return api.post('/logs', data)
    }
}
