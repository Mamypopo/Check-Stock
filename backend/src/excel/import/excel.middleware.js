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
