import { Request, Response } from 'express';
import { PriceLog } from '../models/PriceLog';
import prisma from '../prismaClient';

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const getProductAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { rangeHours = 24 } = req.query;
    const since = new Date(Date.now() - parseInt(rangeHours as string) * 60 * 60 * 1000);

    // Aggregate from MongoDB Time-series
    const aggregationResult = await PriceLog.aggregate([
      { $match: { productId, timestamp: { $gte: since } } },
      { 
        $group: {
          _id: "$productId",
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalLogs: { $sum: 1 }
        }
      }
    ]);

    // Check how many users follow this item (Postgres)
    const activeSubscribers = await prisma.subscription.count({
      where: { productId, isActive: true }
    });

    res.json({
      timeRange: `${rangeHours} hours`,
      priceMetrics: aggregationResult.length > 0 ? aggregationResult[0] : null,
      activeSubscribers
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
