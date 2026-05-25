const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// @desc    Get user dashboard analytics
// @route   GET /api/reports/user-dashboard
// @access  Private
const getUserDashboardAnalytics = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const transactions = await Transaction.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
      status: 'successful'
    });
    
    const now = new Date();
    const currentBudget = await Budget.findOne({
      userId: req.user._id,
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalExpenses,
        transactionCount: transactions.length,
        budgetStatus: currentBudget ? currentBudget.status : 'no_budget'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get income vs expense report
// @route   GET /api/reports/income-expense
// @access  Private
const getIncomeExpenseReport = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
      status: 'successful'
    });

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'deposit') income += t.amount;
      if (t.type === 'withdrawal') expense += t.amount;
      if (t.type === 'transfer') {
        if (t.receiverId?.toString() === req.user._id.toString()) income += t.amount;
        if (t.senderId?.toString() === req.user._id.toString()) expense += t.amount;
      }
    });

    res.status(200).json({ status: 'success', data: { income, expense } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget usage report
// @route   GET /api/reports/budget-usage
// @access  Private
const getBudgetUsageReport = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ month: -1 });
    res.status(200).json({ status: 'success', data: budgets });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserDashboardAnalytics,
  getIncomeExpenseReport,
  getBudgetUsageReport
};
