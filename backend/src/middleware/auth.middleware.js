const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const AppError = require('../utils/errorHandler');
require('dotenv').config();

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const result = await query(
      'SELECT id, name, email, role, avatar FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User no longer exists', 401));
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired, please login again', 401));
    }
    return next(new AppError('Not authorized', 401));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
