const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.route('/').get(getNotifications);
router.route('/read-all').patch(markAllAsRead);
router.route('/:id/read').patch(markAsRead);

module.exports = router;
