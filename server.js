import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import mongoose from 'mongoose'
import fileUpload from 'express-fileupload'

dotenv.config()

// routes
import userRouter from './src/router/userRouter.js'
import categoryRouter from './src/router/categoryRouter.js'
import bookRouter from './src/router/bookRouter.js'
import commentRouter from './src/router/commentRouter.js'

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URL = process.env.MONGODB_URL;

// static folder
app.use(express.static(path.join("src", "files")))

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(fileUpload())
app.use(cors())

// use routes
app.use('/', userRouter);
app.use('/', categoryRouter);
app.use('/', bookRouter);
app.use('/', commentRouter);

// connectDB and run server

const start = async () => {
    try {
        await mongoose.connect(MONGODB_URL)

        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
    } catch (error) {
        console.log(error);        
    }
}


start();