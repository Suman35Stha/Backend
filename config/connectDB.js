import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGODBURL){
    console.error("Please provide MONGO DB URI");
    process.exit(1);
}

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODBURL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from DB');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;