const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get user budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ month: -1 });
    res.status(200).json({ status: 'success', data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { month, totalLimit, categoryLimits, warningThreshold } = req.body;

    if (!month || !totalLimit) {
      res.status(400);
      throw new Error('Please provide month and total limit');
    }

    if (totalLimit <= 0) {
      res.status(400);
      throw new Error('Total limit must be greater than zero');
    }

    // Check if budget for month already exists
    const existingBudget = await Budget.findOne({ userId: req.user._id, month });
    if (existingBudget) {
      res.status(400);
      throw new Error('Budget for this month already exists');
    }

    const budget = await Budget.create({
      userId: req.user._id,
      month,
      totalLimit,
      categoryLimits: categoryLimits || [],
      warningThreshold: warningThreshold || 80,
    });

    res.status(201).json({ status: 'success', data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current month budget status
// @route   GET /api/budgets/current
// @access  Private
const getCurrentBudget = async (req, res, next) => {
  try {
    const now = new Date();
    // format YYYY-MM
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    let budget = await Budget.findOne({ userId: req.user._id, month: currentMonth });

    if (!budget) {
      return res.status(200).json({ status: 'success', data: null, message: 'No budget set for current month' });
    }

    // Calculate actual spent amount from expenses
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const spentAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    budget.spentAmount = spentAmount;

    // Calculate status
    const percentageSpent = (spentAmount / budget.totalLimit) * 100;
    
    if (percentageSpent >= 100) {
      if (budget.status !== 'exceeded') {
        await createNotification(req.user._id, 'Budget Exceeded', `You have exceeded your monthly budget limit of Rs. ${budget.totalLimit}.`, 'budget');
      }
      budget.status = 'exceeded';
    } else if (percentageSpent >= budget.warningThreshold) {
      if (budget.status !== 'nearLimit' && budget.status !== 'exceeded') {
         await createNotification(req.user._id, 'Budget Warning', `You have spent ${percentageSpent.toFixed(1)}% of your monthly budget.`, 'budget');
      }
      budget.status = 'nearLimit';
    } else {
      budget.status = 'safe';
    }

    await budget.save();

    res.status(200).json({ status: 'success', data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    // Ownership check
    if (budget.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized to update this budget');
    }

    const updatedBudget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ status: 'success', data: updatedBudget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    // Ownership check
    if (budget.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized to delete this budget');
    }

    await budget.deleteOne();
    res.status(200).json({ status: 'success', message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, createBudget, getCurrentBudget, updateBudget, deleteBudget };
