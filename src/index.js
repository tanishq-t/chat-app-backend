import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "https://chat-app-snappy.vercel.app",
        credentials: true,
      },
    });

    global.onlineUsers = new Map();

    io.on("connection", (socket) => {
      console.log("⚡ New client connected:", socket.id);

      socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`✅ User added: ${userId}`);
      });

      socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("msg-recieve", {
            from: data.from,
            message: data.msg,
          });
        }
      });

      socket.on("disconnect", () => {
        // Optional: remove from map on disconnect
        for (const [userId, sockId] of onlineUsers.entries()) {
          if (sockId === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
  });
