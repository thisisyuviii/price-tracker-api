import cron from 'node-cron';
import prisma from '../prismaClient';
import { PriceLog } from '../models/PriceLog';
import { sendPriceDropAlert } from './mailer';

// Dummy scraper to generate simulated price changes
function simulateNewPrice(currentPrice: number) {
  // 30% chance the price drops, 70% chance it stays the same or fluctuates slightly
  const change = Math.random();
  if (change < 0.3) {
    return parseFloat((currentPrice * (0.8 + Math.random() * 0.15)).toFixed(2)); // Drops by 5-20%
  }
  return parseFloat((currentPrice + (0.01 * Math.random() - 0.005)).toFixed(2)); // Micro-fluctuation
}

export const startPricePolling = () => {
  console.log('Initializing Price Polling Worker (Runs every 5 minutes)...');
  
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log(`[Worker] Running price check at ${new Date().toISOString()}`);
    try {
      const activeProducts = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          subscriptions: {
            where: { isActive: true },
            include: { user: true }
          }
        }
      });

      for (const product of activeProducts) {
        if (!product.currentPrice) continue;

        const newPrice = simulateNewPrice(product.currentPrice);
        
        // Log snapshot in MongoDB
        await PriceLog.create({
          productId: product.id,
          price: newPrice,
          currency: product.currency
        });

        // Price drop detection
        if (newPrice < product.currentPrice) {
          console.log(`[Worker] Price dropped for Product ${product.id}: ${product.currentPrice} -> ${newPrice}`);
          
          // Update the current price in Postgres
          await prisma.product.update({
            where: { id: product.id },
            data: { currentPrice: newPrice }
          });

          // Check subscriptions and send alerts
          for (const sub of product.subscriptions) {
            if (newPrice <= sub.targetPrice) {
              await sendPriceDropAlert(
                sub.user.email,
                product.name,
                product.currentPrice,
                newPrice,
                product.url
              );
            }
          }
        }
      }
      console.log('[Worker] Completed price check');
    } catch (error) {
      console.error('[Worker] Error during price check:', error);
    }
  });
};
