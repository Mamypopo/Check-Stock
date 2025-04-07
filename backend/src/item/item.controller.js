import * as itemService from './item.service.js'

export const getItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const items = await itemService.getAllItems(page, limit);
        res.json(items);
    } catch (err) {
        console.error('Get items error:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
}

export const createNewItem = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const newItem = await itemService.createItem(req.body, userId);
        res.status(201).json(newItem);
    } catch (err) {
        console.error('Create item error:', err);
        res.status(500).json({ error: 'Failed to create item' });
    }
}

export const updateExistingItem = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const updatedItem = await itemService.updateItem(req.params.id, req.body, userId);
        res.json(updatedItem);
    } catch (err) {
        console.error('Update item error:', err);
        res.status(500).json({ error: 'Failed to update item' });
    }
}

export const deleteExistingItem = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        await itemService.deleteItem(req.params.id, userId);
        res.status(204).send();
    } catch (err) {
        console.error('Delete item error:', err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
}

export const createNewCategory = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const newCategory = await itemService.createCategory(req.body, userId);
        res.status(201).json(newCategory);
    } catch (err) {
        console.error('Create category error:', err);

        if (err.existing) {
            return res.status(400).json({
                existingCategory: err.existing,
            })
        }
        res.status(500).json({ error: 'Failed to create category' });
    }
}

export const getCategoriesList = async (req, res) => {
    try {
        const categories = await itemService.getCategories();
        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
}

export const updateExistingCategory = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const updatedCategory = await itemService.updateCategory(req.params.id, req.body, userId);
        res.json(updatedCategory);
    } catch (err) {
        console.error('Update category error:', err);
        res.status(500).json({ error: 'Failed to update category' });
    }
}

export const deleteExistingCategory = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        await itemService.deleteCategory(req.params.id, userId);
        res.status(204).send();
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
}

export const createNewUnit = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const newUnit = await itemService.createUnit(req.body, userId);
        res.status(201).json(newUnit);
    } catch (err) {
        console.error('Create unit error:', err);

        if (err.existing) {
            return res.status(400).json({
                existingUnit: err.existing,
            })
        }
        res.status(500).json({ error: 'Failed to create unit' });
    }
}

export const getUnitsList = async (req, res) => {
    try {
        const units = await itemService.getUnits();
        res.json(units);
    } catch (err) {
        console.error('Get units error:', err);
        res.status(500).json({ error: 'Failed to fetch units' });
    }
}

export const updateExistingUnit = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const updatedUnit = await itemService.updateUnit(req.params.id, req.body, userId);
        res.json(updatedUnit);
    } catch (err) {
        console.error('Update unit error:', err);
        res.status(500).json({ error: 'Failed to update unit' });
    }
}

export const deleteExistingUnit = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        await itemService.deleteUnit(req.params.id, userId);
        res.status(204).send();
    } catch (err) {
        console.error('Delete unit error:', err);
        res.status(500).json({ error: 'Failed to delete unit' });
    }
}

export const searchItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const query = req.query.query || '';
        const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : undefined;
        const isConsumable = req.query.isConsumable !== undefined ?
            req.query.isConsumable === 'true' : undefined;

        const items = await itemService.searchItems(query, categoryId, isConsumable, page, limit);
        res.json(items);
    } catch (err) {
        console.error('Search items error:', err);
        res.status(500).json({ error: 'Failed to search items' });
    }
}

export const searchItemsForDropdown = async (req, res) => {
    try {
        const { query = '' } = req.query;
        const items = await itemService.searchItemsForDropdown(query);
        res.json(items);
    } catch (error) {
        console.error('Error searching items for dropdown:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการค้นหาสิ่งของ' });
    }
};
