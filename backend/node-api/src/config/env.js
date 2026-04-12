require("dotenv").config();

function parseAllowedOrigins() {
  const normalize = (origin) => `${origin}`.trim().replace(/\/+$/, "");
  const explicit = `${process.env.FRONTEND_URLS || ""}`
    .split(",")
    .map((origin) => normalize(origin))
    .filter(Boolean);

  const primary = normalize(process.env.FRONTEND_URL || "http://localhost:3000");
  const merged = [primary, ...explicit].filter(Boolean);
  return [...new Set(merged)];
}

exports.env = {
  port: process.env.NODE_API_PORT || 4000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/studysync",
  clientUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  clientUrls: parseAllowedOrigins(),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
};
