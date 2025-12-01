import express from 'express';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import userRouter from './src/routes/userRoutes.js';
import vehicleRoutes from './src/routes/vehicleRoutes.js'; // Make sure to import vehicleRoutes
import contactRoutes from './src/routes/contactRoutes.js';
import infoMasterRoutes from './src/routes/infoMasterRoutes.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dotenv.config();
connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/user', userRouter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/info', infoMasterRoutes);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
