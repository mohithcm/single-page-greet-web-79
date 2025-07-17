import DiagnosticTest from '../models/DiagnosticTest.js';
import mongoose from 'mongoose';

// Create Diagnostic Test
const createTest = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      duration,
      preparationInstructions,
      requirements
    } = req.body;

    let center;

    if (req.user.role === 'admin') {
      center = req.body.diagnosticCenter;
    } else if (req.user.role === 'diagnostic_center_admin') {
      center = req.user.diagnosticCenterId;
    }

    const test = await DiagnosticTest.create({
      name,
      description,
      category,
      price,
      duration,
      preparationInstructions,
      requirements,
      diagnosticCenter: center
    });

    res.status(201).json({
      success: true,
      message: 'Diagnostic test created successfully',
      test
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create diagnostic test',
      error: error.message
    });
  }
};

// Get Tests by Center
const getTestsByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { category, priceRange } = req.query;

    let query = { diagnosticCenter: new mongoose.Types.ObjectId(centerId), isActive: true };

    if (category) {
      query.category = category;
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      query.price = { $gte: min, $lte: max };
    }

    const tests = await DiagnosticTest.find(query)
      .populate('diagnosticCenter', 'name address')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      tests
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diagnostic tests',
      error: error.message
    });
  }
};

// Get All Tests
const getAllTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const tests = await DiagnosticTest.find(query)
      .populate('diagnosticCenter', 'name address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await DiagnosticTest.countDocuments(query);
    console.log(total)

    res.status(200).json({
      success: true,
      tests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diagnostic tests',
      error: error.message
    });
  }
};

// Update Test
const updateTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const updates = req.body;

    const test = await DiagnosticTest.findByIdAndUpdate(
      testId,
      updates,
      { new: true, runValidators: true }
    ).populate('diagnosticCenter', 'name address');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnostic test updated successfully',
      test
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diagnostic test',
      error: error.message
    });
  }
};

// Delete Test
const deleteTest = async (req, res) => {
  try {
    const testId = req.params.id;

    const test = await DiagnosticTest.findByIdAndUpdate(
      testId,
      { isActive: false },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnostic test deleted successfully'
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diagnostic test',
      error: error.message
    });
  }
};

export {
  createTest,
  getTestsByCenter,
  getAllTests,
  updateTest,
  deleteTest
};

