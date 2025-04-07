import api from './api';

export const createCheckin = (data) => {
    return api.post('/checkins', data);
};

export const getCheckinsByJobId = (jobId) => {
    return api.get(`/jobs/${jobId}/checkins`);
};

export const getCheckinById = (id) => {
    return api.get(`/checkins/${id}`);
}; 