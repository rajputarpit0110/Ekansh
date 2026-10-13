import express from 'express';
import { importProducts, exportProducts, bulkImageUpload } from '../controllers/bulk.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.post('/products/import', upload.single('file'), importProducts);
router.get('/products/export', exportProducts);
router.post('/images/upload', upload.array('images', 50), bulkImageUpload);

export default router;
