import api from './api.js'

export const fetchJobs = (page = 1, limit = 10, searchParams = {}) => {
    return api.get('/jobs', {
        params: {
            page,
            limit,
            ...searchParams
        }
    });
};

export const createJob = (data) => {
    return api.post('/jobs', data);
};

export const updateJob = (id, data) => {
    return api.put(`/jobs/${id}`, data);
};

export const deleteJob = (id) => {
    return api.delete(`/jobs/${id}`);
};

export const fetchJobById = (id) => {
    return api.get(`/jobs/${id}`);
};