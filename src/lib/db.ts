import mongoose, { Document, Model } from 'mongoose';

interface ITransaction extends Document {
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: Date;
}

interface IBudget extends Document {
  userId: string;
  category: string;
  amount: number;
  month: string;
}

const TransactionSchema = new mongoose.Schema<ITransaction>({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const BudgetSchema = new mongoose.Schema<IBudget>({
  userId: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
}, { timestamps: true });

export const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const Budget: Model<IBudget> = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);

// Disable buffering globally so queries fail immediately if not connected
mongoose.set('bufferCommands', false);

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL: MONGODB_URI is missing. Please add it to your Secrets in AI Studio.');
    return;
  }

  console.log('Attempting to connect to MongoDB...');
  try {
    await mongoose.connect(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed. Check your MONGODB_URI and IP whitelist.');
    // Don't throw, let the API routes handle the disconnected state
  }
}
