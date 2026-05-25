const express = require('express');
const router = express.Router();
const { applyForLoan, getMyLoans, payInstallment, getAllLoans, approveLoan, rejectLoan } = require('../controllers/loanController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getMyLoans)
  .post(applyForLoan);

router.route('/admin')
  .get(admin, getAllLoans);

router.route('/:id/pay')
  .post(payInstallment);

router.route('/:id/approve')
  .post(admin, approveLoan);

router.route('/:id/reject')
  .post(admin, rejectLoan);

module.exports = router;
