const mongoose = require("mongoose");

const roomMemberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["owner", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    room_id: { type: String, required: true, unique: true, index: true },
    roomCode: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    scope: {
      type: String,
      enum: ["private", "public"],
      default: "private",
      index: true,
    },
    roomType: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    topicLabel: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    createdBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    members: {
      type: [roomMemberSchema],
      default: [],
    },
    lastActivity: { type: String, default: "Room created." },
    nextFocus: { type: String, default: "Upload resources and start collaborating." },
    aiRoomReady: { type: Boolean, default: false },
    inviteCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true },
);

roomSchema.index({ scope: 1, updatedAt: -1 });
roomSchema.index({ "members.userId": 1 });
roomSchema.index({ "members.email": 1 });

module.exports = mongoose.model("Room", roomSchema);
