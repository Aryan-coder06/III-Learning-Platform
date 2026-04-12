const express = require("express");
const http = require("http");
const cors = require("cors");
const { env } = require("./config/env");
const connectDB = require("./config/db");
const setupSockets = require("./sockets");
const { ensurePublicRooms } = require("./services/room.service");

// Route imports
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const taskRoutes = require("./routes/taskRoutes");
const contentRoutes = require("./routes/contentRoutes");
const documentRoutes = require("./routes/documentRoutes");
const skillShareRoutes = require("./routes/skillShareRoutes");

const app = express();
const server = http.createServer(app);

// Keep corsOptions aligned with env for sockets and multi-device local testing.
const allowedOrigins = new Set(env.clientUrls || [env.clientUrl]);
const isProd = process.env.NODE_ENV === "production";
const corsOptions = {
    origin(origin, callback) {
        // Allow same-origin/no-origin requests (curl, mobile webviews, server-side checks).
        if (!origin) return callback(null, true);
        // In local/hackathon mode, allow cross-device testing without strict host pinning.
        if (!isProd) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.io
setupSockets(server, corsOptions);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/skill-share", skillShareRoutes);

// Health check
app.get("/", (req, res) => {
    res.send({ status: "ok", message: "StudySync Node API is running." });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "studysync-node-api" });
});

async function startServer() {
    await connectDB();
    await ensurePublicRooms();

    server.listen(env.port, () => {
        console.log(`StudySync Node API running on port ${env.port}.`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start StudySync Node API:", error);
    process.exit(1);
});
