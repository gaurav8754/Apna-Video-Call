import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import dns from "node:dns";

dotenv.config(); 
if (process.platform === "win32") {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} 

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    app.set("mongo_user", process.env.MONGO_USER);
    
    const port = app.get("port");
    server.listen(port, () => {
        console.log(`LISTENING ON PORT ${port}`);
    });

    try {
        const mongoUri = process.env.MONGO_URI || "mongodb+srv://gauravshuklameja_db_user:ApnaCall12345@apnacluster0.qjrtqgn.mongodb.net/apnavideocall?retryWrites=true&w=majority";
        const connectionDb = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
};

start();
