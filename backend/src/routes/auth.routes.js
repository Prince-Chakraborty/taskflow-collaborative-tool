const express = require('express');
const router = express.Router();
const { signup, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Validation rules
const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
