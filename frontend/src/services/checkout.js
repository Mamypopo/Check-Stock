import api from './api';

export const createCheckout = (data) => {
    return api.post('/checkouts', data);
};

export const getCheckoutsByJobId = (jobId) => {
    return api.get(`/jobs/${jobId}/checkouts`);
};

export const getCheckoutById = (id) => {
    return api.get(`/checkouts/${id}`);
}; 