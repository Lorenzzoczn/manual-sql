import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema_cadastros';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true,
  });
  return mongoose.connection;
}


