import logService from './log.service.js'

class LogController {
    async getLogs(req, res) {
        try {
            const {
                page,
                limit,
                action,
                startDate,
                endDate,
                userId,
                targetType,
                targetId
            } = req.query

            const result = await logService.getLogs({
                page,
                limit,
                action,
                startDate,
                endDate,
                userId,
                targetType,
                targetId
            })

            return res.json(result)
        } catch (error) {
            console.error('Error in getLogs controller:', error)
            return res.status(500).json({ message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกการทำงาน' })
        }
    }

    async getLogById(req, res) {
        try {
            const { id } = req.params

            const log = await logService.getLogById(id)

            return res.json(log)
        } catch (error) {
            console.error('Error in getLogById controller:', error)

            if (error.message === 'ไม่พบ log ที่ต้องการ') {
                return res.status(404).json({ message: error.message })
            }

            return res.status(500).json({ message: error.message || 'เกิดข้อผิดพลาดในการดึงรายละเอียดบันทึกการทำงาน' })
        }
    }

    async createLog(req, res) {
        try {
            const { action, userId, jobId, targetType, targetId, details } = req.body

            const log = await logService.createLog({
                action,
                userId,
                jobId,
                targetType,
                targetId,
                details
            })

            return res.status(201).json(log)
        } catch (error) {
            console.error('Error in createLog controller:', error)
            return res.status(500).json({ message: error.message || 'เกิดข้อผิดพลาดในการบันทึกการทำงาน' })
        }
    }
}

export default new LogController()
