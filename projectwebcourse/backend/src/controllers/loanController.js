const Loan = require('../models/Loan');
const Product = require('../models/Product');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const asyncHandler = require('../middlewares/asyncHandler');
const mongoose = require('mongoose');

// @desc    Apply for BNPL loan
// @route   POST /api/loans
// @access  Private
exports.applyForLoan = asyncHandler(async (req, res) => {
  const { productId, downPayment, totalInstallments } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const totalAmount = product.price;
  const remainingAmount = totalAmount - downPayment;
  const installmentAmount = Math.ceil(remainingAmount / totalInstallments);

  // Create repayment schedule
  const repaymentSchedule = [];
  for (let i = 1; i <= totalInstallments; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    repaymentSchedule.push({ dueDate, amount: installmentAmount, status: 'pending' });
  }

  const loan = await Loan.create({
    userId: req.user.id,
    productId,
    totalAmount,
    downPayment,
    remainingAmount,
    installmentAmount,
    totalInstallments,
    status: 'pending', // Requires admin approval
    nextInstallmentDate: repaymentSchedule[0].dueDate,
    repaymentSchedule
  });

  // Check if user has enough balance
  const wallet = await Wallet.findOne({ userId: req.user.id });
  if (!wallet) {
    await Loan.findByIdAndDelete(loan._id);
    return res.status(404).json({ success: false, message: 'Wallet not found' });
  }
  if (wallet.balance < downPayment) {
    await Loan.findByIdAndDelete(loan._id);
    return res.status(400).json({ success: false, message: 'Insufficient wallet balance for the required down payment' });
  }

  res.status(201).json({ success: true, message: 'Application submitted for Admin review', data: loan });
});

// @desc    Get user loans
// @route   GET /api/loans
// @access  Private
exports.getMyLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ userId: req.user.id }).populate('productId');
  res.status(200).json({ success: true, count: loans.length, data: loans });
});

// @desc    Pay installment
// @route   POST /api/loans/:id/pay
// @access  Private
exports.payInstallment = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

  if (loan.status !== 'active') {
    return res.status(400).json({ success: false, message: 'You can only pay installments for active and approved loans.' });
  }

  const wallet = await Wallet.findOne({ userId: req.user.id });
  if (wallet.balance < loan.installmentAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
  }

  // Update schedule
  const installment = loan.repaymentSchedule.find(s => s.status === 'pending');
  if (!installment) return res.status(400).json({ success: false, message: 'No pending installments' });

  installment.status = 'paid';
  installment.paidAt = new Date();

  loan.paidInstallments += 1;
  loan.remainingAmount -= loan.installmentAmount;

  if (loan.paidInstallments === loan.totalInstallments) {
    loan.status = 'completed';
    loan.nextInstallmentDate = null;
  } else {
    const next = loan.repaymentSchedule.find(s => s.status === 'pending');
    loan.nextInstallmentDate = next.dueDate;
  }

  await loan.save();

  // Deduct from wallet
  wallet.balance -= loan.installmentAmount;
  await wallet.save();

  // Record transaction
  await Transaction.create({
    transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderId: req.user.id,
    walletId: wallet._id,
    type: 'billPayment',
    amount: loan.installmentAmount,
    category: 'Debt Repayment',
    description: `Installment for ${loan.productId.name || 'Product'}`,
    status: 'successful'
  });

  // Record expense
  await Expense.create({
    userId: req.user.id,
    title: `Installment: ${loan.productId?.name || 'Product'}`,
    amount: loan.installmentAmount,
    categoryId: 'Debt Repayment',
    date: new Date()
  });

  res.status(200).json({ success: true, data: loan });
});

// @desc    Get all loans (Admin only)
// @route   GET /api/loans/admin
// @access  Private/Admin
exports.getAllLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find().populate('userId', 'name email').populate('productId');
  res.status(200).json({ success: true, count: loans.length, data: loans });
});

// @desc    Approve BNPL loan
// @route   POST /api/loans/:id/approve
// @access  Private/Admin
exports.approveLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id).populate('productId');
  if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
  if (loan.status !== 'pending') return res.status(400).json({ success: false, message: 'Loan is not in pending status' });

  if (!loan.productId) {
    console.error('Approval failed: Product details missing from loan', loan._id);
    return res.status(400).json({ success: false, message: 'Product information is missing for this loan' });
  }

  const wallet = await Wallet.findOne({ userId: loan.userId });
  if (!wallet) return res.status(404).json({ success: false, message: 'User wallet not found' });

  if (wallet.balance < loan.downPayment) {
    return res.status(400).json({ success: false, message: 'User has insufficient balance for down payment' });
  }

  try {
    // Deduct down payment
    wallet.balance -= loan.downPayment;
    await wallet.save();

    // Record transaction
    await Transaction.create({
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: loan.userId,
      walletId: wallet._id,
      type: 'billPayment',
      amount: loan.downPayment,
      category: 'Shopping',
      description: `Down payment for ${loan.productId.name}`,
      status: 'successful'
    });

    // Record expense
    await Expense.create({
      userId: loan.userId,
      title: `Down payment: ${loan.productId.name}`,
      amount: loan.downPayment,
      categoryId: loan.productId.category === 'Agricultural Equipment' ? 'Agriculture' : 'Home Appliances',
      date: new Date()
    });

    loan.status = 'active';
    await loan.save();

    res.status(200).json({ success: true, message: 'Loan approved successfully', data: loan });
  } catch (error) {
    console.error('Error in approveLoan transaction/expense creation:', error);
    res.status(500).json({ success: false, message: error.message || 'Error processing loan approval' });
  }
});

// @desc    Reject BNPL loan
// @route   POST /api/loans/:id/reject
// @access  Private/Admin
exports.rejectLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

  loan.status = 'rejected';
  await loan.save();

  res.status(200).json({ success: true, message: 'Loan rejected', data: loan });
});

