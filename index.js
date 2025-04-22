import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/connectDB.js';
import userRoutes from './routes/user.route.js';

dotenv.config(); //load .env variables

const app = express(); //create a new express app
const PORT = process.env.PORT || 5000; //set the port

//middleware
app.use(helmet()); //use helmet middleware
app.use(cors({
    origin: process.env.BACKEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); //allow all the origins for testing
app.use(morgan('dev')); //use morgan middleware
app.use(express.json()); //use express json middleware
app.use(cookieParser()); //use cookies parser middleware
// app.use(express.static('public'));

//routes
app.get('/', (req, res)=>{
    // res.json({
    //     message: "first page.",
    // });
    res.send('Server is running'); //send a hello message
});

//mount api routes
app.use('/api/user', userRoutes); //mount the user routes

//connect DB
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`); //if the server is running
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();


