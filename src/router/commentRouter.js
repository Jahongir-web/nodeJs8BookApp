import express from 'express';

import commentCtrl from '../controller/commentCtrl.js';

const router = express.Router();


router.post('/comment/:bookId', commentCtrl.addComment);
router.get('/comment/:id', commentCtrl.getComment);


export default router;