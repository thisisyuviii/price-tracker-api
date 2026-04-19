import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import analyticsRoutes from './routes/analytics';
import { startPricePolling } from './services/pollingWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Built-in memory map Rate Limiter (Week 4 Polish)
const ipRequestCounts = new Map<string, { count: number; expiresAt: number }>();
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  let record = ipRequestCounts.get(ip);
  if (!record || record.expiresAt < now) {
    record = { count: 1, expiresAt: now + windowMs };
  } else {
    record.count++;
  }
  
  ipRequestCounts.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Database connections and server
async function startServer() {
  try {
    // Connect to MongoDB
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB for Time-series Logs');
    }

    // Prisma connects automatically on first query, but we can test it if we import prisma

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Start the background worker
      startPricePolling();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
