import express from 'express';
import UserController from '../controllers/authController.js';

const router = express.Router();

router.post('/create-user', UserController.createUser);

export default router;
