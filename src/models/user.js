import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    //for AI Tool Monetization

    credit: { type: Number, default: 50 },
    plan: { type: String, default: 'free' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
