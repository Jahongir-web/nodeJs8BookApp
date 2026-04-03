import express from 'express';

import categoryCtrl from '../controller/categoryCtrl.js';

const router = express.Router();


router.post('/category', categoryCtrl.addCategory);
router.get('/category', categoryCtrl.getAllCategories);
router.get('/category/:id', categoryCtrl.getCategory);
// router.delete('/user/:id', userCtrl.deleteUser);
// router.put('/user/:id', userCtrl.updateUser);


export default router;