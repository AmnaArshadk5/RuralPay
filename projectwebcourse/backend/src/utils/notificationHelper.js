const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type, relatedTransactionId = null) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      relatedTransactionId,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

module.exports = { createNotification };
