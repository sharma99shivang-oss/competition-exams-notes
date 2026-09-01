import mongoose from 'mongoose';
export const connectDB = () => mongoose.connect(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/competition_notes').then(() => console.log('MongoDB connected'));
