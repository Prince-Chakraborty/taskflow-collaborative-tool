const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  changePassword,
  searchUsers
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
