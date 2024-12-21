import express from 'express'
import connectToDB from './src/DBConfig/connectDB.js'
import userRouter from './src/Controller/user.controller.js'
import postRouter from './src/Controller/post.controller.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import commentRouter from './src/Controller/comment.controller.js';
dotenv.config();
const app = express()

app.use(cookieParser())
app.use(express.json())
app.use("/user", userRouter)
app.use("/post", postRouter)
app.use("/comment", commentRouter)

connectToDB().then(()=>{
    app.listen(3000, ()=>{
        console.log('DB connected')
        console.log('Server started')
    })
}).catch((err)=>{
    console.log(err)
})