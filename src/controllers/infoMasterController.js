import InfoMaster from '../models/infoMaster.js';

// ✅ CREATE - Create new info
const createInfo = async (req, res) => {
  try {
    console.log('📝 Creating new info');

    const info = new InfoMaster(req.body);
    await info.save();

    console.log(`✅ Info created with ID: ${info._id}`);

    res.status(201).json({
      success: true,
      message: 'Info created successfully',
      data: info,
    });
  } catch (error) {
    console.error('❌ Create info error:', error);

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
      message: 'Error creating info',
      error: error.message,
    });
  }
};

// ✅ GET ALL - Get all info records (SIMPLE - no pagination)
const getAllInfo = async (req, res) => {
  try {
    console.log('📋 Getting all info records');

    // Get all records, active ones first
    const infoRecords = await InfoMaster.find()
      .sort({ isActive: -1, createdAt: -1 })
      .select('-__v');

    console.log(`✅ Found ${infoRecords.length} info records`);

    res.status(200).json({
      success: true,
      message: 'Info records retrieved successfully',
      data: infoRecords,
      count: infoRecords.length,
    });
  } catch (error) {
    console.error('❌ Get all info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving info records',
      error: error.message,
    });
  }
};

// ✅ GET BY ID - Get single info by ID
const getInfoById = async (req, res) => {
  try {
    console.log('🔍 Getting info by ID:', req.params.id);

    const info = await InfoMaster.findById(req.params.id);

    if (!info) {
      console.log('❌ Info not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Info not found',
      });
    }

    console.log('✅ Info found:', info._id);

    res.status(200).json({
      success: true,
      message: 'Info retrieved successfully',
      data: info,
    });
  } catch (error) {
    console.error('❌ Get info by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid info ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error retrieving info',
      error: error.message,
    });
  }
};

// ✅ UPDATE - Update info by ID
const updateInfo = async (req, res) => {
  try {
    console.log('✏️ Updating info:', req.params.id);

    const info = await InfoMaster.findById(req.params.id);

    if (!info) {
      return res.status(404).json({
        success: false,
        message: 'Info not found',
      });
    }

    // Update fields
    const { address, email, phoneNumber, isActive } = req.body;

    if (address !== undefined) info.address = address;
    if (email !== undefined) info.email = email;
    if (phoneNumber !== undefined) info.phoneNumber = phoneNumber;
    if (isActive !== undefined) info.isActive = isActive;

    await info.save();

    console.log(`✅ Info updated: ${info._id}`);

    res.status(200).json({
      success: true,
      message: 'Info updated successfully',
      data: info,
    });
  } catch (error) {
    console.error('❌ Update info error:', error);

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

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid info ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating info',
      error: error.message,
    });
  }
};

// ✅ DELETE - Delete info by ID
const deleteInfo = async (req, res) => {
  try {
    console.log('🗑️ Deleting info:', req.params.id);

    const info = await InfoMaster.findByIdAndDelete(req.params.id);

    if (!info) {
      console.log('❌ Info not found for deletion:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Info not found',
      });
    }

    console.log(`✅ Info deleted: ${info._id}`);

    res.status(200).json({
      success: true,
      message: 'Info deleted successfully',
      data: {
        id: info._id,
        email: info.email,
      },
    });
  } catch (error) {
    console.error('❌ Delete info error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid info ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting info',
      error: error.message,
    });
  }
};

// ✅ GET ACTIVE - Get currently active info
const getActiveInfo = async (req, res) => {
  try {
    console.log('🔍 Getting active info');

    const activeInfo = await InfoMaster.findOne({ isActive: true });

    if (!activeInfo) {
      console.log('⚠️ No active info found');
      return res.status(404).json({
        success: false,
        message: 'No active info found',
      });
    }

    console.log('✅ Active info found:', activeInfo._id);

    res.status(200).json({
      success: true,
      message: 'Active info retrieved successfully',
      data: activeInfo,
    });
  } catch (error) {
    console.error('❌ Get active info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving active info',
      error: error.message,
    });
  }
};

// ✅ SET ACTIVE - Set a specific info as active
const setActiveInfo = async (req, res) => {
  try {
    console.log('🔄 Setting info as active:', req.params.id);

    const info = await InfoMaster.findById(req.params.id);

    if (!info) {
      return res.status(404).json({
        success: false,
        message: 'Info not found',
      });
    }

    // Deactivate all others
    await InfoMaster.updateMany(
      { _id: { $ne: info._id }, isActive: true },
      { isActive: false }
    );

    // Activate this one
    info.isActive = true;
    await info.save();

    console.log(`✅ Info set as active: ${info._id}`);

    res.status(200).json({
      success: true,
      message: 'Info set as active successfully',
      data: info,
    });
  } catch (error) {
    console.error('❌ Set active info error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid info ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error setting info as active',
      error: error.message,
    });
  }
};

export {
  createInfo,
  getAllInfo,
  getInfoById,
  updateInfo,
  deleteInfo,
  getActiveInfo,
  setActiveInfo,
};
