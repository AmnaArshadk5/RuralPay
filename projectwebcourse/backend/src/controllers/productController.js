const Product = require('../models/Product');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('retailerId', 'name email');
  res.status(200).json({ success: true, count: products.length, data: products });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('retailerId', 'name email');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.status(200).json({ success: true, data: product });
});

// @desc    Create product (Retailer/Admin only)
// @route   POST /api/products
// @access  Private
exports.createProduct = asyncHandler(async (req, res) => {
  req.body.retailerId = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  if (product.retailerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  if (product.retailerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product removed' });
});
