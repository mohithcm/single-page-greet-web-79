import User from '../models/User.js';
import DiagnosticCenter from '../models/DiagnosticCenter.js';
import Appointment from '../models/Appointment.js';
import DiagnosticTest from '../models/DiagnosticTest.js';

// Get Dashboard Stats for Diagnostic Center Admin
const getDiagnosticCenterDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'diagnostic_center_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only diagnostic center admins can access this resource.'
      });
    }

    // Get the diagnostic center for this admin
    const diagnosticCenter = await DiagnosticCenter.findOne({ adminId: userId });
    
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'No diagnostic center found for this admin'
      });
    }

    // Get total appointments for this center
    const totalAppointments = await Appointment.countDocuments({ 
      diagnosticCenterId: diagnosticCenter._id 
    });

    // Get total tests for this center
    const totalTests = await DiagnosticTest.countDocuments({ 
      diagnosticCenter: diagnosticCenter._id,
      isActive: true 
    });

    // Get recent appointments for this center
    const recentAppointments = await Appointment.find({ 
      diagnosticCenterId: diagnosticCenter._id 
    })
      .populate('patientId', 'name email phone')
      .populate('testId', 'name category price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get appointment stats by status for this center
    const appointmentStats = await Appointment.aggregate([
      { $match: { diagnosticCenterId: diagnosticCenter._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await Appointment.countDocuments({
      diagnosticCenterId: diagnosticCenter._id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    res.status(200).json({
      success: true,
      data: {
        diagnosticCenter: {
          _id: diagnosticCenter._id,
          name: diagnosticCenter.name,
          address: diagnosticCenter.address,
          phone: diagnosticCenter.phone,
          email: diagnosticCenter.email
        },
        stats: {
          totalAppointments,
          totalTests,
          todaysAppointments,
          recentAppointments,
          appointmentStats
        }
      }
    });
  } catch (error) {
    console.error('Get diagnostic center dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
};

// Get all testers/staff for the diagnostic center
const getCenterStaff = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'diagnostic_center_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const diagnosticCenter = await DiagnosticCenter.findOne({ adminId: userId });
    
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'No diagnostic center found for this admin'
      });
    }

    // Get all staff members for this center
    const staff = await User.find({ 
      diagnosticCenterId: diagnosticCenter._id.toString(),
      role: { $in: ['diagnostic_center_admin', 'patient'] }
    }).select('-password');

    res.status(200).json({
      success: true,
      data: {
        staff,
        centerName: diagnosticCenter.name
      }
    });
  } catch (error) {
    console.error('Get center staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get center staff',
      error: error.message
    });
  }
};

// Add new tester/staff to diagnostic center
const addCenterStaff = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'diagnostic_center_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const diagnosticCenter = await DiagnosticCenter.findOne({ adminId: userId });
    
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'No diagnostic center found for this admin'
      });
    }

    const { name, email, password, phone, role = 'patient' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new staff member
    const newStaff = await User.create({
      name,
      email,
      password,
      phone,
      role,
      diagnosticCenterId: diagnosticCenter._id.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      data: {
        staff: {
          _id: newStaff._id,
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role,
          phone: newStaff.phone
        }
      }
    });
  } catch (error) {
    console.error('Add center staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add staff member',
      error: error.message
    });
  }
};

// Get appointments for this diagnostic center
const getCenterAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'diagnostic_center_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const diagnosticCenter = await DiagnosticCenter.findOne({ adminId: userId });
    
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'No diagnostic center found for this admin'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    
    let query = { diagnosticCenterId: diagnosticCenter._id };
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('testId', 'name category price')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1 });

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get center appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};

// Get tests for this diagnostic center
const getCenterTests = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'diagnostic_center_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const diagnosticCenter = await DiagnosticCenter.findOne({ adminId: userId });
    
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'No diagnostic center found for this admin'
      });
    }

    const tests = await DiagnosticTest.find({ 
      diagnosticCenter: diagnosticCenter._id,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        tests,
        centerName: diagnosticCenter.name
      }
    });
  } catch (error) {
    console.error('Get center tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tests',
      error: error.message
    });
  }
};

// Add new test to diagnostic center
const addCenterTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'diagnostic_center_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only diagnostic center admins can add tests.'
      });
    }

    const diagnosticCenter = await DiagnosticCenter.findOne({ adminId: userId });
    
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'No diagnostic center found for this admin'
      });
    }

    const {
      name,
      description,
      category,
      price,
      duration,
      preparationInstructions,
      requirements
    } = req.body;

    // Validate required fields
    if (!name || !category || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, price, and duration'
      });
    }

    // Check if test with same name already exists for this center
    const existingTest = await DiagnosticTest.findOne({ 
      name: name.trim(),
      diagnosticCenter: diagnosticCenter._id,
      isActive: true
    });

    if (existingTest) {
      return res.status(400).json({
        success: false,
        message: 'A test with this name already exists in your center'
      });
    }

    // Create new test specifically for this diagnostic center
    // This ensures test is only visible and available for this center
    const newTest = await DiagnosticTest.create({
      name: name.trim(),
      description: description?.trim() || '',
      category,
      price: parseFloat(price),
      duration: parseInt(duration),
      preparationInstructions: preparationInstructions?.trim() || '',
      requirements: requirements || [],
      diagnosticCenter: diagnosticCenter._id, // This binds the test to the specific center
      isActive: true
    });

    // Populate the center information for response
    await newTest.populate('diagnosticCenter', 'name address');

    res.status(201).json({
      success: true,
      message: `Test "${newTest.name}" added successfully to ${diagnosticCenter.name}`,
      data: {
        test: newTest,
        centerInfo: {
          id: diagnosticCenter._id,
          name: diagnosticCenter.name
        }
      }
    });
  } catch (error) {
    console.error('Add center test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add test to your center',
      error: error.message
    });
  }
};
export {
  getDiagnosticCenterDashboard,
  getCenterStaff,
  addCenterStaff,
  getCenterAppointments,
  getCenterTests,
  addCenterTest
};