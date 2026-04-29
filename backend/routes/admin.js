const router = require('express').Router();
const { searchAdmin } = require('../controllers/admin');
const { auth, itsAdmin } = require('../middleware/auth');

router.get('/search', auth, itsAdmin, searchAdmin);

module.exports = router;