// middleware/upload.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ FIXED: Use process.cwd() to get project root directory
const uploadsDir = path.join(process.cwd(), 'uploads');
console.log('📁 Uploads directory path:', uploadsDir);

// Create directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  console.log('📂 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
} else {
  console.log('✅ Uploads directory already exists');
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('🎯 Saving file to:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename =
      'vehicle-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📄 Generated filename:', filename);
    cb(null, filename);
  },
});

// File filter for Excel files only
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  console.log(
    '🔍 Checking file type:',
    file.originalname,
    'Extension:',
    fileExtension
  );

  if (allowedExtensions.includes(fileExtension)) {
    console.log('✅ File type accepted');
    cb(null, true);
  } else {
    console.log('❌ File type rejected');
    cb(
      new Error('Only Excel files (.xlsx, .xls, .csv) are allowed!'),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
