const router = require('express').Router();
const {
  createContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} = require('../controllers/contact');
const { auth, itsAdmin } = require('../middleware/auth');
const validateMongoId = require('../middleware/validId');

// Public route - anyone can submit a contact form
router.post('/', createContact);

// Admin routes - only accessible to admins
router.get('/', auth, itsAdmin, getContacts);
router.get('/:id', validateMongoId, auth, itsAdmin, getContactById);
router.patch('/:id/status', validateMongoId, auth, itsAdmin, updateContactStatus);
router.delete('/:id', validateMongoId, auth, itsAdmin, deleteContact);

module.exports = router;
