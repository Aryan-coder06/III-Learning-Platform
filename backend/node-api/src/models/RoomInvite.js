const mongoose = require("mongoose");

const roomInviteSchema = new mongoose.Schema(
  {
    inviteId: { type: String, required: true, unique: true, index: true },
    roomId: { type: String, required: true, index: true },
    roomCode: { type: String, required: true, index: true },
    roomTitle: { type: String, required: true },
    invitedEmail: { type: String, required: true, index: true },
    invitedBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    inviteLink: { type: String, required: true },
    inviteStatus: {
      type: String,
      enum: ["pending", "accepted", "expired", "logged"],
      default: "logged",
    },
    deliveryMode: {
      type: String,
      enum: ["logged", "email"],
      default: "logged",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RoomInvite", roomInviteSchema);
