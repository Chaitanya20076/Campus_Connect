
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import otpRoutes from "./routes/otpRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

// Request parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan("dev"));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CampusConnect Backend API is running 🚀"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusConnect backend is healthy",
    services: {
      server: "running",
      otp: "route_registered",
      brevo: process.env.BREVO_API_KEY
        ? "configured"
        : "missing_api_key",
      tavily: process.env.TAVILY_API_KEY
        ? "configured"
        : "missing_api_key",
      sarvam: process.env.SARVAM_API_KEY
        ? "configured"
        : "missing_api_key"
    },
    timestamp: new Date().toISOString()
  });
});

// OTP APIs
app.use("/api/otp", otpRoutes);

// Event APIs
app.use("/api/events", eventRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// Start server
app.listen(PORT, () => {
  console.log("--------------------------------------");
  console.log("🚀 CampusConnect Backend Started");
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📧 OTP Send: http://localhost:${PORT}/api/otp/send`);
  console.log(`📧 OTP Verify: http://localhost:${PORT}/api/otp/verify`);
  console.log(`🎯 Events: http://localhost:${PORT}/api/events`);
  console.log("--------------------------------------");
});
