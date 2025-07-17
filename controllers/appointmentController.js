import Appointment from '../models/Appointment.js';
import DiagnosticTest from '../models/DiagnosticTest.js';
import DiagnosticCenter from '../models/DiagnosticCenter.js';

const createAppointment = async (req, res) => {
  try {
    const { center, test, appointmentDate, appointmentTime } = req.body;

    if (!center || !test || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const diagnosticTest = await DiagnosticTest.findById(test);
    if (!diagnosticTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    const appointment = new Appointment({
      patientId: req.user.id,
      diagnosticCenterId: center,
      testId: test,
      appointmentDate,
      appointmentTime,
      totalAmount: diagnosticTest.price,
    });

    await appointment.save();

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Appointments
const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('diagnosticCenterId', 'name address phone')
      .populate('testId', 'name category price duration')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};

// Get Center Appointments (for diagnostic center admins)
const getCenterAppointments = async (req, res) => {
  try {
    const user = req.user;
    let diagnosticCenterId;

    if (user.role === 'admin') {
      diagnosticCenterId = req.params.centerId;
    } else if (user.role === 'diagnostic_center_admin') {
      diagnosticCenterId = user.diagnosticCenterId;
    }

    const appointments = await Appointment.find({ diagnosticCenterId })
      .populate('patientId', 'name email phone')
      .populate('testId', 'name category price duration')
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Get center appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get center appointments',
      error: error.message
    });
  }
};

// Update Appointment Status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, cancellationReason } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email phone')
      .populate('diagnosticCenterId', 'name address phone')
      .populate('testId', 'name category price duration');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

export {
  createAppointment,
  getUserAppointments,
  getCenterAppointments,
  updateAppointmentStatus
};
