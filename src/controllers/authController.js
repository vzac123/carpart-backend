import userModel from '../models/user.js'; // Add .js extension
import bcrypt from 'bcryptjs';

const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.log(`Error hashing password: ${error}`);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

const createUser = async (req, res) => {
  try {
    const userBody = req.body;

    // Validate request body
    if (!userBody.password) {
      return res
        .status(400)
        .json({ message: 'Password is required' });
    }

    userBody.password = await hashPassword(userBody.password);
    console.log('User data:', userBody);

    const db = await userModel.create(userBody);
    console.log('Database response:', db);

    res.status(201).json({
      message: 'User Created Successfully',
      user: db,
    });
  } catch (error) {
    console.log('Error creating user:', error);

    // Handle duplicate key errors (MongoDB)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'User already exists with this email or username',
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};



// Or export as default (choose one)
export default { createUser };
