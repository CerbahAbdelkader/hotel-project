const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader || !tokenHeader.startsWith('Bearer '))
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

  const token = tokenHeader.split(' ')[1].trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
  }
};

const itsAdmin = (req, res, next) => {
  if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
  next();
};

module.exports = { auth, itsAdmin };