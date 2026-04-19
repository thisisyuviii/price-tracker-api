import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceLog extends Document {
  productId: number;
  price: number;
  currency: string;
  timestamp: Date;
}

const PriceLogSchema: Schema = new Schema({
  productId: { type: Number, required: true, index: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  timestamp: { type: Date, default: Date.now, index: true }
});

export const PriceLog = mongoose.model<IPriceLog>('PriceLog', PriceLogSchema);
