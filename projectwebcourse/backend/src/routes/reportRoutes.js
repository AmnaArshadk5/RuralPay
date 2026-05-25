const express = require('express');
const router = express.Router();
const {
  getUserDashboardAnalytics,
  getIncomeExpenseReport,
  getBudgetUsageReport
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/user-dashboard', getUserDashboardAnalytics);
router.get('/income-expense', getIncomeExpenseReport);
router.get('/budget-usage', getBudgetUsageReport);

module.exports = router;
