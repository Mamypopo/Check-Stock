import express from 'express';
import * as itemTemplateController from './itemTemplate.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/item-templates', verifyToken, itemTemplateController.getAllItemTemplates);

router.get('/item-templates/:id', verifyToken, itemTemplateController.getItemTemplateById);

router.post('/item-templates', verifyToken, itemTemplateController.createItemTemplate);

router.put('/item-templates/:id', verifyToken, itemTemplateController.updateItemTemplate);

router.delete('/item-templates/:id', verifyToken, itemTemplateController.deleteItemTemplate);

export default router; 