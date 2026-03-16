const cloudinary = require('../config/cloudinary');
const { query } = require('../config/db');
const AppError = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Multer config - store in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('File type not allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Upload file to card
// @route   POST /api/upload/card/:cardId
// @access  Private
const uploadCardAttachment = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    // Upload to cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'collaborative-tool/attachments',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Save attachment to DB
    const result = await query(
      `INSERT INTO attachments (id, card_id, uploaded_by, file_name, file_url, file_type, file_size, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        uuidv4(),
        cardId,
        userId,
        req.file.originalname,
        uploadResult.secure_url,
        req.file.mimetype,
        req.file.size
      ]
    );

    return successResponse(res, 201, 'File uploaded successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    // Upload to cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'collaborative-tool/avatars',
          transformation: [{ width: 200, height: 200, crop: 'fill' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user avatar
    await query(
      'UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2',
      [uploadResult.secure_url, userId]
    );

    return successResponse(res, 200, 'Avatar uploaded successfully', {
      avatar: uploadResult.secure_url
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Delete attachment
// @route   DELETE /api/upload/attachment/:attachmentId
// @access  Private
const deleteAttachment = async (req, res, next) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;

    const result = await query(
      'SELECT * FROM attachments WHERE id = $1 AND uploaded_by = $2',
      [attachmentId, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Attachment not found or not authorized', 404));
    }

    const attachment = result.rows[0];

    // Extract public_id from cloudinary URL
    const urlParts = attachment.file_url.split('/');
    const publicId = urlParts.slice(-2).join('/').split('.')[0];

    // Delete from cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete from DB
    await query('DELETE FROM attachments WHERE id = $1', [attachmentId]);

    return successResponse(res, 200, 'Attachment deleted successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

module.exports = { upload, uploadCardAttachment, uploadAvatar, deleteAttachment };
