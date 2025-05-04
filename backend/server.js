import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import connectDB from "./config/mongodb.js";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js"; // Assuming userRoutes exist
import dashboardRouter from "./routes/dashboardRoutes.js"; // Assuming dashboardRoutes exist
import footprintRouter from "./routes/footprintRoutes.js"; //import footprint routes

const app = express();
const port = process.env.PORT || 4000; // Use environment variable for port

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(cookieParser()); // Parse cookies from incoming requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies (good practice)

// CORS setup - configure based on your frontend URL
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow requests from frontend URL(s). Use env variable.
    credentials: true, // Allow sending/receiving cookies
  })
);

// API Endpoints
app.get("/", (req, res) => res.send("API Working fine")); // Basic health check

// Mount routers
app.use("/api/auth", authRouter); // Authentication routes
app.use("/api/user", userRouter); // User related routes (like getting profile data)
app.use("/api/dashboard", dashboardRouter); // Dashboard specific routes (will use userAuth middleware)
app.use("/api/footprint", footprintRouter);

// --- Generic Error Handling Middleware ---
// This should be placed after all your routes and other middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack); // Log the error stack
  // Send a generic error response to the client
  res.status(500).json({
    success: false,
    message: "An unexpected internal server error occurred.",
    // In development, you might include err.message or err.stack, but not in production
    // error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start the serverapp.use("/api/footprint", footprintRouter); // Use the footprint routes

app.listen(port, () => console.log(`Server started on PORT:${port}`));
