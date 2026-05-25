const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  downPayment: {
    type: Number,
    required: true
  },
  remainingAmount: {
    type: Number,
    required: true
  },
  installmentAmount: {
    type: Number,
    required: true
  },
  totalInstallments: {
    type: Number,
    required: true
  },
  paidInstallments: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'defaulted', 'rejected'],
    default: 'pending'
  },
  nextInstallmentDate: {
    type: Date,
    required: true
  },
  repaymentSchedule: [{
    dueDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    paidAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
