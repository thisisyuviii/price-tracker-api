import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getProductAnalytics } from '../controllers/analyticsController';

const router = Router();

// Retrieve analytics for a specific product
router.get('/products/:id', authenticateToken, getProductAnalytics);

export default router;
