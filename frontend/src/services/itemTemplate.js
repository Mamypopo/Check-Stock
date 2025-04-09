import api from './api';

export const getItemTemplates = () => {
    return api.get('/item-templates');
};

export const getItemTemplateById = (id) => {
    return api.get(`/item-templates/${id}`);
};

export const createItemTemplate = (data) => {
    return api.post('/item-templates', data);
};

export const updateItemTemplate = (id, data) => {
    return api.put(`/item-templates/${id}`, data);
};

export const deleteItemTemplate = (id) => {
    return api.delete(`/item-templates/${id}`);
}; 