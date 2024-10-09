import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app=express()

app.use(cors({origin: process.env.CORS_ORIGIN,credentials: true}))
app.use(express.json({limit: "16Kb"}))
app.use(express.urlencoded({extended:true,limit:"16Kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
import messageRouter from './routes/message.route.js'


app.use("/api/v1/users", userRouter)
app.use("/api/v1/messages",messageRouter)

export {app}