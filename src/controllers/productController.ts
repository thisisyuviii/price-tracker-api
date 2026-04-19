import { Request, Response } from 'express';
import prisma from '../prismaClient';

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

// Dummy mock scrapper function for now
function mockScrapePrice(url: string) {
  return parseFloat((Math.random() * (1000 - 50) + 50).toFixed(2));
}

export const addProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { url, name, targetPrice } = req.body;
    const userId = req.user?.id;

    if (!url || !userId || !targetPrice) {
      return res.status(400).json({ message: 'URL and targetPrice are required' });
    }

    // Check if product exists physically in DB
    let product = await prisma.product.findUnique({ where: { url } });

    // If it doesn't exist, we scrape initial values and insert it
    if (!product) {
      const initialPrice = mockScrapePrice(url);
      product = await prisma.product.create({
        data: {
          url,
          name: name || `Product - ${new URL(url).hostname}`,
          currentPrice: initialPrice,
          sourceDomain: new URL(url).hostname
        }
      });
    }

    // Now create a subscription for this user
    try {
      const sub = await prisma.subscription.create({
        data: {
          userId,
          productId: product.id,
          targetPrice: parseFloat(targetPrice)
        }
      });
      return res.status(201).json({ message: 'Product tracked successfully', product, subscription: sub });
    } catch (subErr: any) {
      // Prisma error P2002 means unique constraint failed
      if (subErr.code === 'P2002') {
        return res.status(409).json({ message: 'You are already tracking this product' });
      }
      throw subErr;
    }

  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const subscriptions = await prisma.subscription.findMany({
      where: { userId, isActive: true },
      include: { product: true }
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
