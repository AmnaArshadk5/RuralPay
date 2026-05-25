const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { createNotification } = require('../utils/notificationHelper');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const blockedUsers = await User.countDocuments({ status: 'blocked' });

    const totalTransactions = await Transaction.countDocuments();
    const flaggedTransactions = await Transaction.countDocuments({ suspiciousFlag: true });

    // Calculate Transaction Volume (Successful only)
    const txns = await Transaction.find({ status: 'successful' });
    const transactionVolume = txns.reduce((sum, txn) => sum + txn.amount, 0);

    // Calculate total system balance
    const wallets = await Wallet.find();
    const systemBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalTransactions,
        flaggedTransactions,
        transactionVolume,
        systemBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Block user
// @route   PATCH /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot block another admin');
    }

    user.status = 'blocked';
    await user.save();

    await createNotification(user._id, 'Account Blocked', 'Your account has been blocked by an administrator.', 'security');

    await createAuditLog(req.user._id, 'BLOCK_USER', 'user', user._id, { reason: req.body.reason || 'No reason provided' });

    res.status(200).json({ status: 'success', message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock user
// @route   PATCH /api/admin/users/:id/unblock
// @access  Private/Admin
const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.status = 'active';
    await user.save();

    await createNotification(user._id, 'Account Activated', 'Your account has been reactivated by an administrator.', 'security');

    await createAuditLog(req.user._id, 'UNBLOCK_USER', 'user', user._id);

    res.status(200).json({ status: 'success', message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all wallets
// @route   GET /api/admin/wallets
// @access  Private/Admin
const getAllWallets = async (req, res, next) => {
  try {
    const wallets = await Wallet.find().populate('userId', 'name email');
    res.status(200).json({ status: 'success', data: wallets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get flagged transactions
// @route   GET /api/admin/transactions/flagged
// @access  Private/Admin
const getFlaggedTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ suspiciousFlag: true })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction volume report
// @route   GET /api/admin/reports/transaction-volume
// @access  Private/Admin
const getTransactionVolumeReport = async (req, res, next) => {
  try {
    const txns = await Transaction.find({ status: 'successful' });
    const volume = txns.reduce((sum, t) => sum + t.amount, 0);
    res.status(200).json({ status: 'success', data: { volume, count: txns.length } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system balance report
// @route   GET /api/admin/reports/system-balance
// @access  Private/Admin
const getSystemBalanceReport = async (req, res, next) => {
  try {
    const wallets = await Wallet.find();
    const balance = wallets.reduce((sum, w) => sum + w.balance, 0);
    res.status(200).json({ status: 'success', data: { balance, count: wallets.length } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find().populate('actorId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction status
// @route   PATCH /api/admin/transactions/:id/status
// @access  Private/Admin
const updateTransactionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'successful', 'failed', 'flagged'];
    
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    const oldStatus = transaction.status;
    transaction.status = status;
    
    // If flagged, also update the suspicious flag
    if (status === 'flagged') {
      transaction.suspiciousFlag = true;
    } else if (oldStatus === 'flagged') {
      transaction.suspiciousFlag = false;
    }

    await transaction.save();

    await createNotification(
      transaction.senderId || transaction.receiverId,
      'Transaction Update',
      `Your transaction ${transaction.transactionId} status has been updated to ${status}.`,
      'system'
    );

    await createAuditLog(req.user._id, 'UPDATE_TXN_STATUS', 'transaction', transaction._id, { oldStatus, newStatus: status });

    res.status(200).json({ status: 'success', message: `Transaction status updated to ${status}`, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wallet status (Freeze/Unfreeze)
// @route   PATCH /api/admin/wallets/:id/toggle-status
// @access  Private/Admin
const toggleWalletStatus = async (req, res, next) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) {
      res.status(404);
      throw new Error('Wallet not found');
    }

    const oldStatus = wallet.status;
    wallet.status = wallet.status === 'active' ? 'frozen' : 'active';
    await wallet.save();

    await createAuditLog(req.user._id, 'TOGGLE_WALLET_STATUS', 'wallet', wallet._id, { oldStatus, newStatus: wallet.status });

    res.status(200).json({ status: 'success', message: `Wallet status updated to ${wallet.status}`, data: wallet });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};


