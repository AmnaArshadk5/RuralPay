const Expense = require('../models/Expense');

// @desc    Get all expenses for logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search } = req.query;
    let query = { userId: req.user._id };

    if (category) query.categoryId = category;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json({ status: 'success', data: expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense summary (total and by category)
// @route   GET /api/expenses/summary
// @access  Private
const getExpenseSummary = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    
    let totalAmount = 0;
    const categoryTotals = {};
    
    // Simple current month filter
    const now = new Date();
    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    let currentMonthTotal = 0;

    expenses.forEach(exp => {
      totalAmount += exp.amount;
      categoryTotals[exp.categoryId] = (categoryTotals[exp.categoryId] || 0) + exp.amount;
    });

    currentMonthExpenses.forEach(exp => {
      currentMonthTotal += exp.amount;
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalAmount,
        currentMonthTotal,
        categoryTotals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly expense summary
// @route   GET /api/expenses/summary/monthly
// @access  Private
const getMonthlyExpenseSummary = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const now = new Date();
    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    let currentMonthTotal = 0;
    currentMonthExpenses.forEach(exp => {
      currentMonthTotal += exp.amount;
    });

    res.status(200).json({
      status: 'success',
      data: {
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        total: currentMonthTotal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise expense summary
// @route   GET /api/expenses/summary/categories
// @access  Private
const getCategoryExpenseSummary = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const categoryTotals = {};

    expenses.forEach(exp => {
      categoryTotals[exp.categoryId] = (categoryTotals[exp.categoryId] || 0) + exp.amount;
    });

    res.status(200).json({
      status: 'success',
      data: categoryTotals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, categoryId, paymentMethod, date, notes } = req.body;

    if (!title || !amount || !categoryId || !date) {
      res.status(400);
      throw new Error('Please provide title, amount, category, and date');
    }

    if (amount <= 0) {
      res.status(400);
      throw new Error('Expense amount must be greater than zero');
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      categoryId,
      paymentMethod,
      date,
      notes,
    });

    res.status(201).json({ status: 'success', data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    // Ownership check
    if (expense.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized to update this expense');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ status: 'success', data: updatedExpense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    // Ownership check
    if (expense.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized to delete this expense');
    }

    await expense.deleteOne();
    res.status(200).json({ status: 'success', message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getExpenses, 
  getExpenseSummary, 
  getMonthlyExpenseSummary, 
  getCategoryExpenseSummary, 
  createExpense, 
  updateExpense, 
  deleteExpense 
};
