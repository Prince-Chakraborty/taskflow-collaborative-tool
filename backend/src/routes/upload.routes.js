const express = require('express');
const router = express.Router();
const {
  upload,
  uploadCardAttachment,
  uploadAvatar,
  deleteAttachment
} = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes protected
router.use(protect);

router.post('/card/:cardId', upload.single('file'), uploadCardAttachment);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/attachment/:attachmentId', deleteAttachment);

module.exports = router;
