const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./utils/prisma");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const agencyRoutes = require("./routes/agencyRoutes");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const clientPortalRoutes = require("./routes/clientPortalRoutes");
const taskRoutes = require("./routes/taskRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const activityRoutes = require("./routes/activityRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const fileRoutes = require("./routes/fileRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// CORS MUST COME BEFORE API ROUTES
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/agencies", agencyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/client-portal", clientPortalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "AppZex backend is running",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Backend is running, but database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});