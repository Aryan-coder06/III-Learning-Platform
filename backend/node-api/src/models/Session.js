const mongoose = require("mongoose");

const sessionParticipantSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null },
  },
  { _id: false },
);

const transcriptSegmentSchema = new mongoose.Schema(
  {
    speakerUserId: { type: String, default: "" },
    speakerName: { type: String, default: "" },
    text: { type: String, required: true },
    startedAtMs: { type: Number, default: null },
    endedAtMs: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const sessionActionItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    text: { type: String, required: true },
    ownerUserId: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    suggestedStatus: {
      type: String,
      enum: ["todo", "in_progress", "done", "needs_clarification"],
      default: "todo",
    },
    confidence: { type: Number, default: 0.5 },
    rationale: { type: String, default: "" },
    sourceExcerpt: { type: String, default: "" },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    roomId: { type: String, default: "", index: true },
    roomCode: { type: String, default: "", index: true },
    roomTitle: { type: String, default: "" },
    createdBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    participants: { type: [sessionParticipantSchema], default: [] },
    status: {
      type: String,
      enum: ["live", "ended"],
      default: "live",
      index: true,
    },
    startedAt: { type: Date, default: Date.now, index: true },
    endedAt: { type: Date, default: null },
    transcriptSegments: { type: [transcriptSegmentSchema], default: [] },
    transcriptText: { type: String, default: "" },
    summary: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
    actionItems: { type: [sessionActionItemSchema], default: [] },
    processingStatus: {
      type: String,
      enum: ["pending", "analyzing", "analyzed", "failed"],
      default: "pending",
    },
    analysisError: { type: String, default: "" },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
);

sessionSchema.index({ "participants.userId": 1, startedAt: -1 });

module.exports = mongoose.model("Session", sessionSchema);

