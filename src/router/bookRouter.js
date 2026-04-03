import express from 'express';

import bookCtrl from '../controller/bookCtrl.js';

const router = express.Router();


router.post('/book', bookCtrl.addBook);
router.get('/book/:id', bookCtrl.download);
router.get('/view/:id', bookCtrl.getBook);
router.get('/like/:bookId', bookCtrl.like);
router.get('/dislike/:bookId', bookCtrl.dislike);
router.get('/search', bookCtrl.search);


export default router;