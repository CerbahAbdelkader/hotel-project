const { check, validationResult } = require('express-validator');
const {StatusCodes} =require('http-status-codes')
const validateRegister = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),

  // Backward compatibility: allow clients still sending "username"
  check('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  (req, res, next) => {
    if (!req.body.name && req.body.username) {
      req.body.name = req.body.username;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateRegister;