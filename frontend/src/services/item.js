import api from './api'

export const fetchItems = (page = 1, limit = 10) => api.get('/items', { params: { page, limit } });
export const fetchItemById = (id) => {
    return api.get(`/items/${id}`);
};
export const searchItemsForDropdown = (query) => api.get('/items/dropdown', { params: { query } });

export const importExcel = (formData) => api.post('/excel/import', formData)

export const searchItems = (params) => api.get('/items/search', { params });

export const fetchCategories = () => api.get('/items/categories');
export const createCategory = (data) => api.post('/items/categories', data);
export const updateCategory = (id, data) => api.put(`/items/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/items/categories/${id}`);

export const fetchUnits = () => api.get('/items/units');
export const createUnit = (data) => api.post('/items/units', data);
export const updateUnit = (id, data) => api.put(`/items/units/${id}`, data);
export const deleteUnit = (id) => api.delete(`/items/units/${id}`);

export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);

