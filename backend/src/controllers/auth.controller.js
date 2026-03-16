const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const AppError = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');
require('dotenv').config();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
      `INSERT INTO users (id, name, email, password, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, email, role, avatar, created_at`,
      [uuidv4(), name, email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, user.id]
    );

    return successResponse(res, 201, 'Account created successfully', {
      user,
      token,
      refreshToken
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    // Check if user exists
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Invalid email or password', 401));
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, user.id]
    );

    return successResponse(res, 200, 'Login successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token,
      refreshToken
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token matches in DB
    const result = await query(
      'SELECT id, name, email, role FROM users WHERE id = $1 AND refresh_token = $2',
      [decoded.id, refreshToken]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const user = result.rows[0];
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [newRefreshToken, user.id]
    );

    return successResponse(res, 200, 'Token refreshed', {
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    await query(
      'UPDATE users SET refresh_token = NULL WHERE id = $1',
      [req.user.id]
    );
    return successResponse(res, 200, 'Logged out successfully');
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    return successResponse(res, 200, 'User fetched successfully', result.rows[0]);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

module.exports = { signup, login, refreshToken, logout, getMe };
