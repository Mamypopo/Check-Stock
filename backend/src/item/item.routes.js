import express from 'express'
import * as itemController from './item.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', verifyToken, itemController.getItems)
router.post('/', verifyToken, itemController.createNewItem)
router.put('/:id', verifyToken, itemController.updateExistingItem)
router.delete('/:id', verifyToken, itemController.deleteExistingItem)

router.get('/search', verifyToken, itemController.searchItems)
router.get('/dropdown', itemController.searchItemsForDropdown);

router.post('/categories', verifyToken, itemController.createNewCategory)
router.get('/categories', verifyToken, itemController.getCategoriesList)
router.put('/categories/:id', verifyToken, itemController.updateExistingCategory)
router.delete('/categories/:id', verifyToken, itemController.deleteExistingCategory)

router.post('/units', verifyToken, itemController.createNewUnit)
router.get('/units', verifyToken, itemController.getUnitsList)
router.put('/units/:id', verifyToken, itemController.updateExistingUnit)
router.delete('/units/:id', verifyToken, itemController.deleteExistingUnit)

export default router
