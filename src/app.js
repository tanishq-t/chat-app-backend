import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Middleware setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);

// Optional: add a 404 and error handler middleware at the end
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

export { app };
