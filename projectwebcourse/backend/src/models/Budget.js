const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String, // e.g., 'YYYY-MM'
      required: true,
    },
    totalLimit: {
      type: Number,
      required: true,
      min: [0.01, 'Total limit must be greater than zero'],
    },
    categoryLimits: [
      {
        category: {
          type: String,
          required: true,
        },
        limit: {
          type: Number,
          required: true,
          min: [0.01, 'Category limit must be greater than zero'],
        },
      },
    ],
    spentAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['safe', 'nearLimit', 'exceeded'],
      default: 'safe',
    },
    warningThreshold: {
      type: Number,
      default: 80, // percentage e.g., 80%
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', budgetSchema);
