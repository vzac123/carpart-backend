// controllers/vehicleController.js
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Vehicle from '../models/vehicle.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadExcel = async (req, res) => {
  console.log('🚀 Upload endpoint called');

  try {
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file',
      });
    }

    console.log('✅ File received via multer:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
    });

    // ✅ FIXED: Use buffer processing instead of file path
    let fileBuffer;
    try {
      fileBuffer = fs.readFileSync(req.file.path);
      console.log('📊 File buffer size:', fileBuffer.length, 'bytes');
    } catch (fileError) {
      console.error('❌ Error reading file buffer:', fileError);
      return res.status(400).json({
        success: false,
        message: 'Error reading uploaded file',
        error: fileError.message,
      });
    }

    // Process from buffer instead of file path
    console.log('📖 Reading Excel from buffer...');
    let workbook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      console.log('✅ Excel file read successfully from buffer');
    } catch (excelError) {
      console.error('❌ Error reading Excel file:', excelError);
      // Clean up file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid Excel file format',
        error: excelError.message,
      });
    }

    const sheetName = workbook.SheetNames[0];
    console.log('📊 Sheet name:', sheetName);

    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    console.log('🔄 Converting to JSON...');
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📈 Extracted ${jsonData.length} records`);

    if (jsonData.length === 0) {
      console.log('❌ No data found in Excel file');
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no data',
      });
    }

    // Log first row to see the structure
    console.log('📋 First row sample:', jsonData[0]);

    // Validate and transform data
    const validatedVehicles = [];
    const errors = [];

    console.log('🔍 Validating data...');
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i];

        // Transform Excel data to match our schema
        const vehicleData = {
          productName: String(
            row.productName ||
              row['Product Name'] ||
              row['productname'] ||
              ''
          ).trim(),
          brand: String(row.brand || row.Brand || '').trim(),
          model: String(row.model || row.Model || '').trim(),
          year: parseInt(row.year || row.Year) || 0,
          price: parseFloat(row.price || row.Price) || 0,
          color: String(row.color || row.Color || '').trim(),
          fuelType: String(
            row.fuelType ||
              row['Fuel Type'] ||
              row.FuelType ||
              row['fueltype'] ||
              ''
          ).trim(),
          transmission: String(
            row.transmission || row.Transmission || ''
          ).trim(),
          mileage: parseFloat(row.mileage || row.Mileage) || 0,
        };

        // Basic validation
        if (
          !vehicleData.productName ||
          !vehicleData.brand ||
          !vehicleData.model
        ) {
          throw new Error(
            'Missing required fields (productName, brand, model)'
          );
        }

        if (
          isNaN(vehicleData.year) ||
          vehicleData.year < 1900 ||
          vehicleData.year > new Date().getFullYear() + 1
        ) {
          throw new Error(`Invalid year: ${vehicleData.year}`);
        }

        if (isNaN(vehicleData.price) || vehicleData.price < 0) {
          throw new Error(`Invalid price: ${vehicleData.price}`);
        }

        if (isNaN(vehicleData.mileage) || vehicleData.mileage < 0) {
          throw new Error(`Invalid mileage: ${vehicleData.mileage}`);
        }

        // Validate enum values
        const validFuelTypes = [
          'Petrol',
          'Diesel',
          'Electric',
          'Hybrid',
          'CNG',
          'LPG',
        ];
        const validTransmissions = [
          'Manual',
          'Automatic',
          'Semi-Automatic',
        ];

        if (!validFuelTypes.includes(vehicleData.fuelType)) {
          throw new Error(
            `Invalid fuel type: ${vehicleData.fuelType}`
          );
        }

        if (!validTransmissions.includes(vehicleData.transmission)) {
          throw new Error(
            `Invalid transmission: ${vehicleData.transmission}`
          );
        }

        validatedVehicles.push(vehicleData);
      } catch (error) {
        errors.push({
          row: i + 2,
          error: error.message,
          data: jsonData[i],
        });
      }
    }

    console.log(
      `✅ Validation complete: ${validatedVehicles.length} valid, ${errors.length} errors`
    );

    // Save to database if we have valid data
    if (validatedVehicles.length > 0) {
      console.log('💾 Saving to database...');
      try {
        // Save to database in batches
        const BATCH_SIZE = 1000;
        let savedCount = 0;

        for (
          let i = 0;
          i < validatedVehicles.length;
          i += BATCH_SIZE
        ) {
          const batch = validatedVehicles.slice(i, i + BATCH_SIZE);
          await Vehicle.insertMany(batch, { ordered: false });
          savedCount += batch.length;
          console.log(
            `✅ Saved ${savedCount}/${validatedVehicles.length} records...`
          );
        }

        console.log('🎉 All data saved successfully to database');
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        // Clean up file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
          success: false,
          message: 'Database error while saving vehicles',
          error: dbError.message,
        });
      }
    }

    // Clean up uploaded file
    console.log('🧹 Cleaning up uploaded file...');
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('✅ File cleaned up');
    }

    // Send success response
    const response = {
      success: true,
      message: 'File processed successfully',
      summary: {
        totalRecords: jsonData.length,
        successfullyProcessed: validatedVehicles.length,
        failedRecords: errors.length,
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : [],
    };

    console.log('📤 Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('🚨 CRITICAL Upload error:', error);
    console.error('Error stack:', error.stack);

    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      console.log('🧹 Cleaning up file after error...');
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing file',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    });
  }
};

const createVehicles = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res
      .status(201)
      .json({ message: 'Successfully created vehicle', vehicle });
  } catch (error) {
    res.status(400).json({ message: 'Error creating Vehicle' });
  }
};

// ✅ UPDATE - Update vehicle by ID
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true,
      }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle,
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message,
    });
  }
};

// ✅ DELETE - Delete vehicle by ID
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
      data: vehicle,
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message,
    });
  }
};

// Get all vehicles with pagination
const getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vehicle.countDocuments();

    res.status(200).json({
      success: true,
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message,
    });
  }
};

// Add a test endpoint
const testEndpoint = async (req, res) => {
  console.log('✅ Test endpoint called');
  res.json({
    success: true,
    message: 'Vehicle controller is working!',
    timestamp: new Date().toISOString(),
  });
};

export {
  uploadExcel,
  getVehicles,
  testEndpoint,
  createVehicles,
  updateVehicle,
  deleteVehicle,
};
