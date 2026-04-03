import express from 'express';

import userCtrl from '../controller/userCtrl.js';

const router = express.Router();


router.post('/signup', userCtrl.signUp);
router.post('/login', userCtrl.logIn);
router.get('/user', userCtrl.getAllUsers);
router.delete('/user/:id', userCtrl.deleteUser);
router.put('/user/:id', userCtrl.updateUser);


export default router;