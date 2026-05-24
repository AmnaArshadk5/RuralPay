const express = require('express');
const router = express.Router();
const { getBudgets, createBudget, getCurrentBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(createBudget);

router.get('/current', getCurrentBudget);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
