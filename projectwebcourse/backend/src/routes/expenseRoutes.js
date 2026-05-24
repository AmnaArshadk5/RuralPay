const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  getExpenseSummary, 
  getMonthlyExpenseSummary,
  getCategoryExpenseSummary,
  createExpense, 
  updateExpense, 
  deleteExpense 
} = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/summary')
  .get(getExpenseSummary);

router.route('/summary/monthly')
  .get(getMonthlyExpenseSummary);

router.route('/summary/categories')
  .get(getCategoryExpenseSummary);

router.route('/:id')
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
