import api from './api';

export const getJobItems = (jobId) => {
    return api.get(`/jobs/${jobId}/items`);
};

export const addJobItem = (data) => {
    return api.post('/job-items', data);
};

export const updateJobItem = (id, data) => {
    return api.put(`/job-items/${id}`, data);
};

export const deleteJobItem = (id) => {
    return api.delete(`/job-items/${id}`);
};

export const addItemsFromTemplate = (data) => {
    return api.post('/job-items/from-template', data);
}; 