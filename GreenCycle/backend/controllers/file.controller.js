import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Set up storage configuration
const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (request, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (request, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload function
const uploadFile = (request, response) => {
  if (!request.file) {
    return response.status(400).json({ 
        error: true,
        success: false,
        message: 'No file uploaded' 
    });
  }
  response.json({ 
    error: false,
    success: true,
    message: 'File uploaded successfully', 
    file: request.file.filename 
  });
};

// Delete file function
const deleteFile = (request, response) => {
  const { filename } = request.query;

  const filePath = path.join('uploads', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return response.status(500).json({
        error: true,
        success: false,
        message: 'File not found or failed to delete',
      });
    }
    response.json({
      error: false,
      success: true,
      message: 'File deleted successfully',
    });
  });
};

export { upload, uploadFile, deleteFile };
