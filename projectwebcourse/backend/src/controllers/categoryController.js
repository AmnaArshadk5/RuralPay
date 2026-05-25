const Category = require('../models/Category');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get active categories (or all for admin)
// @route   GET /api/categories
// @access  Protected
const getCategories = async (req, res, next) => {
  try {
    const type = req.query.type;
    const filter = {};
    
    // Only return active categories for normal users
    if (req.user && req.user.role !== 'admin') {
      filter.isActive = true;
    } else if (req.query.activeOnly === 'true') {
      filter.isActive = true;
    }

    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category (Admin)
// @route   POST /api/admin/categories
// @access  Protected/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, type, description } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Category name is required');
    }

    const categoryExists = await Category.findOne({ name, type });
    if (categoryExists) {
      res.status(400);
      throw new Error('Category with this name and type already exists');
    }

    const category = await Category.create({
      name,
      type,
      description,
      createdBy: req.user._id
    });

    await createAuditLog(req.user._id, 'CREATE_CATEGORY', 'category', category._id, { name, type });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category (Admin)
// @route   PUT /api/admin/categories/:id
// @access  Protected/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    category.name = name || category.name;
    category.description = description || category.description;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    await createAuditLog(req.user._id, 'UPDATE_CATEGORY', 'category', updatedCategory._id, { name, isActive });

    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

// @desc    Disable/Enable a category (Admin)
// @route   PATCH /api/admin/categories/:id/disable
// @access  Protected/Admin
const disableCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    category.isActive = !category.isActive;
    await category.save();

    await createAuditLog(req.user._id, 'TOGGLE_CATEGORY', 'category', category._id, { isActive: category.isActive });

    res.json(category);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  disableCategory
};
