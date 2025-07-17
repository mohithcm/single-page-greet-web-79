
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create super admin
    const superAdmin = await User.create({
      name: 'Super Administrator',
      email: 'superadmin@healthcare.com',
      password: 'SuperAdmin123!',
      phone: '+1234567890',
      role: 'super_admin',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'USA'
      }
    });

    console.log('Super admin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password: SuperAdmin123!');
    console.log('Please change the password after first login');

    return;
  } catch (error) {
    console.error('Error creating super admin:', error);
    return;
  }
};
export default createSuperAdmin;
// createSuperAdmin();
