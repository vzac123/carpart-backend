// models/Vehicle.js
import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 1900 && v <= new Date().getFullYear() + 1;
        },
        message: 'Year must be between 1900 and current year + 1',
      },
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'],
    },
    transmission: {
      type: String,
      required: true,
      enum: ['Manual', 'Automatic', 'Semi-Automatic'],
    },
    mileage: {
      type: Number,
      required: true,
      min: [0, 'Mileage cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
vehicleSchema.index({ brand: 1, model: 1 });
vehicleSchema.index({ year: -1 });

export default mongoose.model('Vehicle', vehicleSchema);
