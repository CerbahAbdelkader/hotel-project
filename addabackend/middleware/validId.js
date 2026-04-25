const mongoose = require('mongoose');

const validateMongoId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid MongoDB ID' });
  }

  next();
};

module.exports = validateMongoId;