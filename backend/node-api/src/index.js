const express = require("express");
const http = require("http");
const cors = require("cors");
const { env } = require("./config/env");
const connectDB = require("./config/db");
const setupSockets = require("./sockets");

// Route imports
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const taskRoutes = require("./routes/taskRoutes");
const contentRoutes = require("./routes/contentRoutes");

const app = express();
const server = http.createServer(app);

// Keep corsOptions aligned with env for sockets
const corsOptions = {
    origin: env.clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize Socket.io
setupSockets(server, corsOptions);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/content", contentRoutes);

// Health check
app.get("/", (req, res) => {
    res.send({ status: "ok", message: "StudySync Node API is running." });
});

// Start Server
server.listen(env.port, () => {
    console.log(`StudySync Node API running on port ${env.port}.`);
});
