const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error('Invalid file extension. Only academic PDF documents (.pdf) are permitted.'),
      false
    );
  }

  if (file.mimetype !== 'application/pdf') {
    return cb(
      new Error('Invalid MIME type. Expected application/pdf.'),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

// Middleware to check PDF magic bytes (%PDF-) in the buffer
const validatePdfSignature = (req, res, next) => {
  if (!req.file) {
    // If no file, continue (could be external URL resource or handled by controller)
    return next();
  }

  const buffer = req.file.buffer;
  if (!buffer || buffer.length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Uploaded file is corrupted or empty.',
      error: 'CORRUPTED_FILE',
    });
  }

  // Check magic bytes "%PDF-" (Hex: 25 50 44 46 2D)
  const header = buffer.toString('utf-8', 0, 5);
  if (!header.startsWith('%PDF')) {
    return res.status(400).json({
      success: false,
      message: 'Security validation failed: File content does not match genuine PDF format.',
      error: 'INVALID_PDF_SIGNATURE',
    });
  }

  next();
};

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed limit of 20MB.',
        error: 'FILE_TOO_LARGE',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      error: 'UPLOAD_ERROR',
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      error: 'INVALID_FILE',
    });
  }
  next();
};

module.exports = {
  upload,
  validatePdfSignature,
  handleUploadErrors,
  MAX_FILE_SIZE_BYTES,
};
