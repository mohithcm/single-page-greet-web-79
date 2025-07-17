import express from 'express';
import {
  getDiagnosticCenterDashboard,
  getCenterStaff,
  addCenterStaff,
  getCenterAppointments,
  getCenterTests,
  addCenterTest
} from '../controllers/diagnosticCenterAdminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require diagnostic center admin authentication
router.use(protect);
router.use(authorize('diagnostic_center_admin'));

// Dashboard route
router.get('/dashboard', getDiagnosticCenterDashboard);

// Staff management routes
router.get('/staff', getCenterStaff);
router.post('/staff', addCenterStaff);

// Appointments and tests routes
router.get('/appointments', getCenterAppointments);
router.get('/tests', getCenterTests);
router.post('/tests', addCenterTest);

export default router;