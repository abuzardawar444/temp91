import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cloudinary from 'cloudinary';
import helmet from 'helmet';
import mongSanitize from 'express-mongo-sanitize';

//Show log for request type and status
import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import jobRouter from './routes/jobRouter.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';

import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import {authenticateUser} from './middleware/authMiddleware.js';
import {dirname} from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, './client/dist')));


if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(mongSanitize());

const port = process.env.PORT || 5100;

app.use('/api/v1/jobs', authenticateUser, jobRouter);
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/auth', authRouter);

app.get('*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'));
})

app.use('*', (req,res)=>{
    res.status(404).json({message: "Page not found"})
})
// Should be last one
app.use(errorHandlerMiddleware);

try {
    await mongoose.connect(process.env.MONGO_URL);
    // Listen to server
    app.listen(port,() => {
        console.log(`Server is running on port ${port}`);
    })

} catch (error) {
    console.log(error);
    process.exit(1);
}