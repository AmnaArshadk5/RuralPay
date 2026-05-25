const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  getAllWallets,
  getAllTransactions,
  getFlaggedTransactions,
  getTransactionVolumeReport,
  getSystemBalanceReport,
  getAuditLogs,
  updateTransactionStatus,
  toggleWalletStatus,
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All admin routes must be protected AND require admin role
router.use(protect, admin);

const { createCategory, updateCategory, disableCategory } = require('../controllers/categoryController');

router.get('/dashboard', getDashboardAnalytics);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.get('/wallets', getAllWallets);
router.patch('/wallets/:id/toggle-status', toggleWalletStatus);
router.patch('/transactions/:id/status', updateTransactionStatus);
router.get('/transactions', getAllTransactions);
router.get('/transactions/flagged', getFlaggedTransactions);

// Admin Reports & Audit
router.get('/reports/transaction-volume', getTransactionVolumeReport);
router.get('/reports/system-balance', getSystemBalanceReport);
router.get('/audit-logs', getAuditLogs);

// Admin Category Routes
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.patch('/categories/:id/disable', disableCategory);

module.exports = router;
