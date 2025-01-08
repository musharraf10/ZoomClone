import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import {createServer} from "node:http";

import { Server } from "socket.io";
import mongoose from "mongoose";

import cors from "cors";
import exp from "node:constants";
import { connect } from 'node:http2';

import {connectToSocket} from "./controllers/socketManager.js";

import userRouter from "./routes/user.routes.js";


const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port",(process.env.PORT || 8080));
app.use(cors());
app.use(express.json({limit: '50kb'}));
app.use(express.urlencoded({limit: '50kb', extended: true}));

app.use("/api/v1/user/", userRouter);

const start = async () => {
    app.set("mongo_user")
    const connectionDB = await mongoose.connect("mongodb+srv://skmusharaf01:Skmusharaf13@zoom.rmmsj.mongodb.net/myDatabase?retryWrites=true&w=majority")
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

    // console.log(`Connected to MongoDB: ${connectionDB.connection.host}`);
    server.listen(app.get("port") , () => {
        console.log("SERVER STARTED PORT NO : 8080...");
    });
}

start();