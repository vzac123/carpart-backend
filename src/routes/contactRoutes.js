import express from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
  deleteAllContacts
} from '../controllers/contactController.js';

const router = express.Router();

// CRUD Routes
router.post('/', createContact); // Create new contact
router.get('/', getAllContacts); // Get all contacts
router.get('/:id', getContactById); // Get single contact by ID
router.delete('/:id', deleteContact); // Delete single contact
router.delete('/', deleteAllContacts); // Delete all contacts

export default router;