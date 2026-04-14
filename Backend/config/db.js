const mongoose = require('mongoose');

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/student_performance_predictor';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 4000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildMongoUri = () => {
  const raw = process.env.MONGO_URI || DEFAULT_LOCAL_URI;
  if (!raw.startsWith('mongodb+srv://')) {
    return raw;
  }

  // Ensure Atlas URI has an explicit db name for predictable auth/db routing.
  const afterHost = raw.split('.mongodb.net/')[1] || '';
  if (!afterHost || afterHost.startsWith('?')) {
    return raw.replace('.mongodb.net/', '.mongodb.net/student_performance_predictor');
  }

  return raw;
};

const connectDB = async () => {
  const mongoUri = buildMongoUri();

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt += 1;
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4,
      });

      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);

      if (attempt >= MAX_RETRIES) {
        throw error;
      }

      await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error('MongoDB connection failed after maximum retries');
};

module.exports = connectDB;
