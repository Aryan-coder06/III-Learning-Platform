const mongoose = require("mongoose");

const messageSourceSchema = new mongoose.Schema(
  {
    chunkId: { type: String, required: true },
    documentId: { type: String, default: "" },
    filename: { type: String, required: true },
    pageNumber: { type: Number, default: 0 },
    excerpt: { type: String, required: true },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true, index: true },
    message_id: { type: String, required: true, unique: true, index: true },
    roomId: { type: String, required: true, index: true },
    scope: {
      type: String,
      enum: ["private", "public"],
      default: "private",
      index: true,
    },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, default: "" },
    content: { type: String, required: true, trim: true },
    messageType: {
      type: String,
      enum: ["human", "bot", "system"],
      default: "human",
      index: true,
    },
    triggeredQuery: { type: String, default: "" },
    queryIntent: { type: String, default: "" },
    sources: {
      type: [messageSourceSchema],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

messageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
