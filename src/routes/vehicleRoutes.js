// routes/vehicleRoutes.js
import express from 'express';
import {
  uploadExcel,
  getVehicles,
  testEndpoint,
  createVehicles,
  updateVehicle,
  deleteVehicle,
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

router.put('/:id', updateVehicle);

export default router;
