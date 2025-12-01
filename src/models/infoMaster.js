import mongoose from 'mongoose';

const infoMasterSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please provide a valid phone number (10-15 digits)']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one active record exists
infoMasterSchema.pre('save', async function(next) {
  if (this.isActive) {
    try {
      await mongoose.model('InfoMaster').updateMany(
        { _id: { $ne: this._id }, isActive: true },
        { isActive: false }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const InfoMaster = mongoose.model('InfoMaster', infoMasterSchema);

export default InfoMaster;