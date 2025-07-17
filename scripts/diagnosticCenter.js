import mongoose from 'mongoose';
import DiagnosticCenter from '../models/DiagnosticCenter.js';
import dotenv from 'dotenv';

dotenv.config();

const createDiagnosticCenters = async () => {
    try {
        // await mongoose.connect(process.env.MONGODB_URI);
        // console.log('Connected to MongoDB');

        const centers = await DiagnosticCenter.insertMany([
            {
                name: "Apollo Diagnostic Center - Indiranagar",
                description: "Advanced diagnostics with modern equipment and trained staff.",
                address: {
                    street: "12, 1st Main Road",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560038",
                    country: "India"
                },
                phone: "080-22223344",
                email: "indiranagar@apollohealth.com",
                operatingHours: {
                    monday: { open: "08:00", close: "20:00" },
                    tuesday: { open: "08:00", close: "20:00" },
                    wednesday: { open: "08:00", close: "20:00" },
                    thursday: { open: "08:00", close: "20:00" },
                    friday: { open: "08:00", close: "20:00" },
                    saturday: { open: "08:00", close: "18:00" },
                    sunday: { open: "09:00", close: "13:00" }
                },
                services: ["Blood Test", "X-Ray", "ECG", "MRI"]
            },
            {
                name: "Thyrocare - Koramangala",
                description: "Affordable and accurate pathology tests.",
                address: {
                    street: "57, 6th Block, 80 Feet Road",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560095",
                    country: "India"
                },
                phone: "080-33669988",
                email: "koramangala@thyrocare.com",
                operatingHours: {
                    monday: { open: "07:00", close: "21:00" },
                    tuesday: { open: "07:00", close: "21:00" },
                    wednesday: { open: "07:00", close: "21:00" },
                    thursday: { open: "07:00", close: "21:00" },
                    friday: { open: "07:00", close: "21:00" },
                    saturday: { open: "07:00", close: "21:00" },
                    sunday: { open: "08:00", close: "14:00" }
                },
                services: ["Thyroid Test", "Diabetes Panel", "CBC", "Vitamin D"],
            },
            {
                name: "Healthians Diagnostic Center - HSR Layout",
                description: "Reliable at-home sample collection service.",
                address: {
                    street: "24th Main, Sector 2, HSR Layout",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560102",
                    country: "India"
                },
                phone: "080-45004500",
                email: "hsr@healthians.com",
                operatingHours: {
                    monday: { open: "06:00", close: "22:00" },
                    tuesday: { open: "06:00", close: "22:00" },
                    wednesday: { open: "06:00", close: "22:00" },
                    thursday: { open: "06:00", close: "22:00" },
                    friday: { open: "06:00", close: "22:00" },
                    saturday: { open: "06:00", close: "22:00" },
                    sunday: { open: "07:00", close: "13:00" }
                },
                services: ["Liver Function Test", "Kidney Panel", "HbA1c"],
            },
            {
                name: "Clumax Diagnostics - Jayanagar",
                description: "Multi-speciality diagnostic and imaging center.",
                address: {
                    street: "11th Main, 4th Block, Jayanagar",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560041",
                    country: "India"
                },
                phone: "080-26534400",
                email: "jayanagar@clumax.com",
                operatingHours: {
                    monday: { open: "08:00", close: "21:00" },
                    tuesday: { open: "08:00", close: "21:00" },
                    wednesday: { open: "08:00", close: "21:00" },
                    thursday: { open: "08:00", close: "21:00" },
                    friday: { open: "08:00", close: "21:00" },
                    saturday: { open: "08:00", close: "20:00" },
                    sunday: { open: "09:00", close: "13:00" }
                },
                services: ["Ultrasound", "CT Scan", "MRI", "ECG"]
            },
            {
                name: "Medall Clumax - Whitefield",
                description: "High-tech diagnostic equipment with NABL accreditation.",
                address: {
                    street: "ITPL Main Road, Whitefield",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560066",
                    country: "India"
                },
                phone: "080-49034400",
                email: "whitefield@medall.in",
                operatingHours: {
                    monday: { open: "07:30", close: "20:00" },
                    tuesday: { open: "07:30", close: "20:00" },
                    wednesday: { open: "07:30", close: "20:00" },
                    thursday: { open: "07:30", close: "20:00" },
                    friday: { open: "07:30", close: "20:00" },
                    saturday: { open: "07:30", close: "20:00" },
                    sunday: { open: "08:00", close: "13:00" }
                },
                services: ["Full Body Checkup", "Hormone Test", "Cardiac Risk Test"],
            },
            {
                name: "SRL Diagnostics - Malleshwaram",
                description: "Trusted pathology and diagnostic lab.",
                address: {
                    street: "17th Cross, Malleshwaram",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560003",
                    country: "India"
                },
                phone: "080-23334422",
                email: "malleshwaram@srl.com",
                operatingHours: {
                    monday: { open: "08:00", close: "20:00" },
                    tuesday: { open: "08:00", close: "20:00" },
                    wednesday: { open: "08:00", close: "20:00" },
                    thursday: { open: "08:00", close: "20:00" },
                    friday: { open: "08:00", close: "20:00" },
                    saturday: { open: "08:00", close: "18:00" },
                    sunday: { open: "09:00", close: "12:00" }
                },
                services: ["CBC", "Lipid Profile", "Allergy Test"],
            },
            {
                name: "Aster Labs - Marathahalli",
                description: "Diagnostic services from Aster Hospitals group.",
                address: {
                    street: "Varthur Road, Marathahalli",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560037",
                    country: "India"
                },
                phone: "080-66442288",
                email: "marathahalli@asterlabs.in",
                operatingHours: {
                    monday: { open: "07:00", close: "22:00" },
                    tuesday: { open: "07:00", close: "22:00" },
                    wednesday: { open: "07:00", close: "22:00" },
                    thursday: { open: "07:00", close: "22:00" },
                    friday: { open: "07:00", close: "22:00" },
                    saturday: { open: "07:00", close: "22:00" },
                    sunday: { open: "08:00", close: "13:00" }
                },
                services: ["Diabetes Panel", "Liver Profile", "HIV Test"] 
            },
            {
                name: "Dr. Lal PathLabs - BTM Layout",
                description: "NABL certified pathology lab with accurate reports.",
                address: {
                    street: "Outer Ring Road, BTM 2nd Stage",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560076",
                    country: "India"
                },
                phone: "080-42115588",
                email: "btm@lalpathlabs.com",
                operatingHours: {
                    monday: { open: "07:30", close: "20:30" },
                    tuesday: { open: "07:30", close: "20:30" },
                    wednesday: { open: "07:30", close: "20:30" },
                    thursday: { open: "07:30", close: "20:30" },
                    friday: { open: "07:30", close: "20:30" },
                    saturday: { open: "07:30", close: "20:30" },
                    sunday: { open: "08:00", close: "13:00" }
                },
                services: ["CBC", "TSH", "Diabetes Test", "Blood Group"]
            },
            {
                name: "PathCare Labs - Rajajinagar",
                description: "Complete health check-up packages and lab tests.",
                address: {
                    street: "80 Feet Road, Rajajinagar",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560010",
                    country: "India"
                },
                phone: "080-23442233",
                email: "rajajinagar@pathcarelabs.com",
                operatingHours: {
                    monday: { open: "07:00", close: "21:00" },
                    tuesday: { open: "07:00", close: "21:00" },
                    wednesday: { open: "07:00", close: "21:00" },
                    thursday: { open: "07:00", close: "21:00" },
                    friday: { open: "07:00", close: "21:00" },
                    saturday: { open: "07:00", close: "21:00" },
                    sunday: { open: "08:00", close: "12:00" }
                },
                services: ["X-Ray", "Vitamin B12", "Renal Panel"]
            },
            {
                name: "Sakra Diagnostic Center - Bellandur",
                description: "State-of-the-art diagnostic support from Sakra World Hospital.",
                address: {
                    street: "Outer Ring Road, Bellandur",
                    city: "Bengaluru",
                    state: "Karnataka",
                    zipCode: "560103",
                    country: "India"
                },
                phone: "080-49694969",
                email: "bellandur@sakrahospital.com",
                operatingHours: {
                    monday: { open: "08:00", close: "21:00" },
                    tuesday: { open: "08:00", close: "21:00" },
                    wednesday: { open: "08:00", close: "21:00" },
                    thursday: { open: "08:00", close: "21:00" },
                    friday: { open: "08:00", close: "21:00" },
                    saturday: { open: "08:00", close: "20:00" },
                    sunday: { open: "09:00", close: "13:00" }
                },
                services: ["CT Scan", "MRI", "Pathology", "Cardiology Tests"]
            }
        ]);

        console.log(`Created ${centers.length} diagnostic centers`);
    } catch (error) {
        console.error('Error creating diagnostic centers:', error);
    } finally {
        mongoose.connection.close();
    }
};

export default createDiagnosticCenters;
  