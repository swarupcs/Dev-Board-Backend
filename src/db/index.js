import mongoose from 'mongoose';

import { MONGO_URI } from '../config/serverConfig.js';  

export const connectDB = async () => {
    try {
       await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB Successfully'); 
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
}