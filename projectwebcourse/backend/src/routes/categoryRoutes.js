const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getCategories);

module.exports = router;
