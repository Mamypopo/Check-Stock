import * as jobService from './job.service.js';

export const createJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        const job = await jobService.createJob(req.body, userId);
        res.status(201).json(job);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to create job'
        });
    }
};

export const getJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            query,
            status,
            startDate,
            endDate
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const searchParams = {};

        if (query) searchParams.query = query;
        if (status) searchParams.status = status;
        if (startDate) searchParams.startDate = startDate;
        if (endDate) searchParams.endDate = endDate;

        const result = await jobService.getJobs(pageNumber, limitNumber, searchParams);

        res.json(result);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลงาน' });
    }
};

export const getJobById = async (req, res) => {
    try {
        const job = await jobService.getJobById(req.params.id);
        res.status(200).json(job);
    } catch (error) {
        console.error('Error fetching job by ID:', error);
        res.status(error.statusCode || 500).json({
            error: error.message || 'ไม่สามารถดึงข้อมูลงานได้',
        });
    }
};

export const updateJob = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.userId;
        const job = await jobService.updateJob(id, req.body, userId);
        res.status(200).json(job);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to update job'
        });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.userId;
        await jobService.deleteJob(id, userId);
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(error.statusCode || 500).json({
            error: error.message || 'Failed to delete job'
        });
    }
};

