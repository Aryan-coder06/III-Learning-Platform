require("dotenv").config();

exports.env = {
  port: process.env.NODE_API_PORT || 4000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/studysync",
  clientUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
