import Contact from '../models/contact.js';

// ✅ CREATE - Create new contact message
const createContact = async (req, res) => {
  try {
    console.log('📨 Creating new contact message');

    const contact = new Contact(req.body);
    await contact.save();

    console.log(`✅ Contact created with ID: ${contact._id}`);

    res.status(201).json({
      success: true,
      message:
        'Thank you for your message. We will get back to you soon!',
      data: contact,
    });
  } catch (error) {
    console.error('❌ Create contact error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating contact message',
      error: error.message,
    });
  }
};

// ✅ GET ALL - Get all contact messages
const getAllContacts = async (req, res) => {
  try {
    console.log('📋 Getting all contacts');

    // Simple pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get contacts with pagination
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Contact.countDocuments();
    const totalPages = Math.ceil(total / limit);

    console.log(
      `✅ Found ${contacts.length} contacts out of ${total}`
    );

    res.status(200).json({
      success: true,
      message: 'Contacts retrieved successfully',
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('❌ Get all contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contacts',
      error: error.message,
    });
  }
};

// ✅ GET BY ID - Get single contact by ID
const getContactById = async (req, res) => {
  try {
    console.log('🔍 Getting contact by ID:', req.params.id);

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      console.log('❌ Contact not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    console.log('✅ Contact found:', contact._id);

    res.status(200).json({
      success: true,
      message: 'Contact retrieved successfully',
      data: contact,
    });
  } catch (error) {
    console.error('❌ Get contact by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error retrieving contact',
      error: error.message,
    });
  }
};

// ✅ DELETE - Delete contact by ID
const deleteContact = async (req, res) => {
  try {
    console.log('🗑️ Deleting contact:', req.params.id);

    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      console.log(
        '❌ Contact not found for deletion:',
        req.params.id
      );
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    console.log(`✅ Contact deleted: ${contact._id}`);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
      },
    });
  } catch (error) {
    console.error('❌ Delete contact error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message,
    });
  }
};

// ✅ DELETE ALL - Delete all contacts
const deleteAllContacts = async (req, res) => {
  try {
    console.log('🗑️ Deleting all contacts');

    const totalCount = await Contact.countDocuments();

    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No contacts found to delete',
        deletedCount: 0,
      });
    }

    console.log(`🗑️ Deleting ${totalCount} contacts...`);

    const result = await Contact.deleteMany({});

    console.log(
      `✅ Successfully deleted ${result.deletedCount} contacts`
    );

    res.status(200).json({
      success: true,
      message: `All contacts deleted successfully (${result.deletedCount} records)`,
      deletedCount: result.deletedCount,
      previousCount: totalCount,
    });
  } catch (error) {
    console.error('❌ Delete all contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all contacts',
      error: error.message,
    });
  }
};

export {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
  deleteAllContacts,
};
