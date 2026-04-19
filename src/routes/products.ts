import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { addProduct, getMyProducts } from '../controllers/productController';

const router = Router();

// Retrieve all subscriptions/products for the logged-in user
router.get('/', authenticateToken, getMyProducts);

// Add a new product (and automatically subscribe) via URL
router.post('/', authenticateToken, addProduct);

export default router;
