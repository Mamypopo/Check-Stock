import prisma from '../config/database.js'
import { logAction } from '../utils/logger.js'


export const createJob = async (data, userId) => {
    const job = await prisma.job.create({
        data: {
            ...data,
            createdBy: userId || null
        }
    });

    await logAction({
        action: 'CREATE_JOB',
        userId,
        jobId: job.id,
        targetType: 'Job',
        targetId: job.id,
        details: {
            title: job.title,
            description: job.description,
            message: `สร้างงาน "${job.title}"`,
            scheduledAt: `วันที่ "${job.scheduledAt}"`,
            location: `สถานที่ "${job.location}"`,
            status: `สถานะ "${job.status}"`,
            createdBy: `สร้างโดย "${job.createdBy}"`,
            note: `หมายเหตุ "${job.notes}"`,
        }
    });

    return job;
};


export const getJobs = async (page = 1, limit = 10, searchParams = {}) => {
    const offset = (page - 1) * limit;
    const { query, status, startDate, endDate } = searchParams;

    const whereCondition = {
        isDelete: false,
    };

    if (query) {
        whereCondition.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } }
        ];
    }

    if (status) {
        whereCondition.status = status;
    }

    if (startDate || endDate) {
        whereCondition.scheduledAt = {};

        if (startDate) {
            whereCondition.scheduledAt.gte = new Date(startDate);
        }

        if (endDate) {
            whereCondition.scheduledAt.lte = new Date(endDate);
        }
    }

    const [jobs, total] = await Promise.all([
        prisma.job.findMany({
            where: whereCondition,
            skip: offset,
            take: limit,
            orderBy: { scheduledAt: 'desc' },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        }),
        prisma.job.count({
            where: whereCondition,
        }),
    ]);

    return { jobs, total, page, limit };
};

export const updateJob = async (id, data, userId) => {
    const existingJob = await prisma.job.findUnique({
        where: { id }
    });

    if (!existingJob) {
        throw new Error('ไม่พบงานที่ต้องการแก้ไข');
    }

    const updatedJob = await prisma.job.update({
        where: { id },
        data,
    });

    await logAction({
        action: 'UPDATE_JOB',
        userId,
        jobId: id,
        targetType: 'Job',
        targetId: id,
        details: {
            oldTitle: existingJob.title,
            newTitle: updatedJob.title,
            oldDescription: existingJob.description,
            newDescription: updatedJob.description,
            oldStatus: existingJob.status,
            newStatus: updatedJob.status,
            message: `แก้ไขงาน "${existingJob.title}" เป็น "${updatedJob.title}"`
        }
    });

    return updatedJob;
};

export const deleteJob = async (id, userId) => {
    const job = await prisma.job.findUnique({
        where: { id }
    });

    if (!job) {
        throw new Error('ไม่พบงานที่ต้องการลบ');
    }

    const result = await prisma.job.update({
        where: { id },
        data: {
            isDelete: true,
            deletedAt: new Date(),
        },
    });

    await logAction({
        action: 'DELETE_JOB',
        userId,
        jobId: id,
        targetType: 'Job',
        targetId: id,
        details: {
            title: job.title,
            description: job.description,
            message: `ลบงาน "${job.title}"`
        }
    });

    return result;
};

export const getJobById = async (id) => {
    const jobId = parseInt(id, 10);

    if (isNaN(jobId)) {
        const error = new Error('รหัสงานต้องเป็นตัวเลข');
        error.statusCode = 400;
        throw error;
    }

    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            jobItems: {
                include: {
                    item: {
                        include: {
                            category: true,
                            Unit: true
                        }
                    }
                }
            }
        },
    });

    if (!job) {
        throw new Error('ไม่พบงานที่ต้องการ');
    }

    return job;
};
