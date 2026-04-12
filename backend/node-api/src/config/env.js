require("dotenv").config();

function normalizeUrl(value) {
  return `${value || ""}`.trim().replace(/\/+$/, "");
}

function parseAllowedOrigins() {
  const explicit = `${process.env.FRONTEND_URLS || ""}`
    .split(",")
    .map((origin) => normalizeUrl(origin))
    .filter(Boolean);

  const primary = normalizeUrl(process.env.FRONTEND_URL || "");
  const merged = [primary, ...explicit].filter(Boolean);
  return [...new Set(merged)];
}

exports.env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || "",
  clientUrl: process.env.FRONTEND_URL || "",
  clientUrls: parseAllowedOrigins(),
  redisUrl: process.env.REDIS_URL || "",
  redisEnabled: `${process.env.REDIS_ENABLED || "false"}`.toLowerCase() === "true",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  aiServiceUrl: normalizeUrl(process.env.AI_SERVICE_URL || ""),
};
