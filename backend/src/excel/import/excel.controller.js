import { parseExcelBuffer } from './excel.parser.js'
import { importItemsFromExcel } from './excel.service.js'
import fs from 'fs/promises'
import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true)
    } else {
        cb(new Error('Only .xlsx files are allowed'), false)
    }
}

const upload = multer({ storage, fileFilter })

export default upload

export const importExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' })
        }

        const items = await parseExcelBuffer(req.file.buffer)

        if (items.length === 0) {
            return res.status(400).json({ error: 'ไม่พบข้อมูลในไฟล์ Excel' })
        }

        const userId = req.user?.id || req.user?.userId
        const result = await importItemsFromExcel(items, userId)

        res.json({
            message: 'นำเข้าข้อมูลสำเร็จ',
            summary: {
                total: items.length,
                created: result.created,
                skipped: result.skipped,
                errors: result.errors
            },
            errorDetails: result.errorDetails
        })
    } catch (err) {
        console.error('Import error:', err)
        res.status(500).json({ error: 'การนำเข้าล้มเหลว', detail: err.message })
    }
}