const { query } = require('../config/db');
const AppError = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');
const bcrypt = require('bcryptjs');

// @desc    Get all users (for assigning tasks)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, avatar, role, created_at FROM users ORDER BY name ASC'
    );
    return successResponse(res, 200, 'Users fetched successfully', result.rows);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    return successResponse(res, 200, 'User fetched successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user.id;

    const result = await query(
      `UPDATE users SET name = COALESCE($1, name), 
       avatar = COALESCE($2, avatar), 
       updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, name, email, avatar, role`,
      [name, avatar, userId]
    );

    return successResponse(res, 200, 'Profile updated successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 400));
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    return successResponse(res, 200, 'Password changed successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Search users by name or email
// @route   GET /api/users/search?q=query
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return next(new AppError('Search query is required', 400));
    }

    const result = await query(
      `SELECT id, name, email, avatar FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1 
       LIMIT 10`,
      [`%${q}%`]
    );

    return successResponse(res, 200, 'Users found', result.rows);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, changePassword, searchUsers };
