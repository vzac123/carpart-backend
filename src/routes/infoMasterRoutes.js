import express from 'express';
import {
  createInfo,
  getAllInfo,
  getInfoById,
  updateInfo,
  deleteInfo,
  getActiveInfo,
  setActiveInfo,
} from '../controllers/infoMasterController.js';

const router = express.Router();

// CRUD Routes
router.post('/', createInfo); // Create new info
router.get('/', getAllInfo); // Get all info (SIMPLE - no pagination)
router.get('/active', getActiveInfo); // Get active info
router.get('/:id', getInfoById); // Get single info by ID
router.put('/:id', updateInfo); // Update info
router.patch('/:id/activate', setActiveInfo); // Set info as active
router.delete('/:id', deleteInfo); // Delete info

export default router;
