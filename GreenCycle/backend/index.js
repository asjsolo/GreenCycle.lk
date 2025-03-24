import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import communityRouter from "./Route/community.route.js";

dotenv.config();

const app = express()

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}))

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, ()=>{
        console.log("Server is listning", PORT);
    })
})
.catch(err => console.error("MongoDB connection error", err))

app.get('/', (request, response)=> {
    response.json({
        message : "Server is running " + PORT
    })
})

app.use('/api', communityRouter);


