import express from 'express'
import connectToDB from './src/DBConfig/connectDB.js'
import userRouter from './src/Controller/user.controller.js'
import postRouter from './src/Controller/post.controller.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import commentRouter from './src/Controller/comment.controller.js';
import likeRouter from './src/Controller/like.controller.js';
import connectionRouter from './src/Controller/connection.controller.js';
import otpRouter from './src/Controller/otp.controller.js';
dotenv.config();
const app = express()

app.use(cookieParser())
app.use(express.json())
app.use("/user", userRouter)
app.use("/post", postRouter)
app.use("/comment", commentRouter)
app.use("/like", likeRouter)
app.use("/connection", connectionRouter)
app.use("/otp", otpRouter)

connectToDB().then(()=>{
    app.listen(3000, ()=>{
        console.log('DB connected')
        console.log('Server started')
    })
}).catch((err)=>{
    console.log(err)
})