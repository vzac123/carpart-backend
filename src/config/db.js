import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_PASS);
    console.log('DATABASE CONNECTED SUCCESSFULLY');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
