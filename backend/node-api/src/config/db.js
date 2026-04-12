const mongoose = require("mongoose");
const { env } = require("./env");

const connectDB = async () => {
    try {
        if (!env.mongoUri) {
            throw new Error("MONGO_URI is not configured.");
        }
        await mongoose.connect(env.mongoUri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
