import xlsx from 'xlsx'

export const parseExcelBuffer = async (fileBuffer) => {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' })

    const items = rawData.map((row) => ({
        code: row['รหัสกลุ่มสินทรัพย์'] || null,
        name: row['ชื่อสินทรัพย์'],
        categoryName: row['หมวดหมู่'],
        unitName: row['หน่วย'],
        stock: row['จำนวน'],
    }))

    return items
}