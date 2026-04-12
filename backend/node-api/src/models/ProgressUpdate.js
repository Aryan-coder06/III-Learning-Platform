const mongoose = require("mongoose");

const progressUpdateSchema = new mongoose.Schema(
  {
    progressUpdateId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    roomId: { type: String, default: "", index: true },
    roomCode: { type: String, default: "" },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: "" },
    title: { type: String, required: true },
    detail: { type: String, default: "" },
    sourceExcerpt: { type: String, default: "" },
    aiConfidence: { type: Number, default: 0.5 },
    suggestedStatus: {
      type: String,
      enum: ["todo", "in_progress", "done", "needs_clarification"],
      default: "todo",
    },
    decisionStatus: {
      type: String,
      enum: ["suggested", "accepted", "rejected", "completed"],
      default: "suggested",
      index: true,
    },
    decidedBy: {
      userId: { type: String, default: "" },
      name: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    decidedAt: { type: Date, default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
);

progressUpdateSchema.index({ userId: 1, decisionStatus: 1, createdAt: -1 });

module.exports = mongoose.model("ProgressUpdate", progressUpdateSchema);

