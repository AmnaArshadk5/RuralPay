const express = require('express');
const router = express.Router();
const { getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Matches "User" module requirements in project brief
router.route('/profile')
  .get(protect, getMe)
  .put(protect, updateProfile);

module.exports = router;
