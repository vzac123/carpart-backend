// routes/vehicleRoutes.js
import express from 'express';
import {
  uploadExcel,
  getVehicles,
  testEndpoint,
  createVehicles,
  updateVehicle,
  deleteVehicle,
  deleteAllVehicles,
  getVehicleById,
} from '../controllers/vehicleController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Test endpoint first
router.get('/test', testEndpoint);

// Then the upload endpoint
router.post('/upload', upload.single('excelFile'), uploadExcel);
router.get('/', getVehicles);
router.post('/', createVehicles);

router.delete('/:id', deleteVehicle);

// Add this route
router.get('/:id', getVehicleById); // Get single vehicle by ID

router.put('/:id', updateVehicle);

router.delete('/', deleteAllVehicles);

export default router;
