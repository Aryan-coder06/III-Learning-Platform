const { v4: uuidv4 } = require("uuid");

const Room = require("../models/Room");
const RoomInvite = require("../models/RoomInvite");
const { env } = require("../config/env");
const { syncPrivateRoom } = require("./ai-room.service");

const DEFAULT_PUBLIC_ROOMS = [
  {
    roomId: "os",
    roomCode: "PUBLIC-OS",
    title: "Operating Systems",
    description: "Discuss process scheduling, memory management, deadlocks, and OS internals.",
    topicLabel: "Operating Systems",
    tags: ["OS", "Systems", "Theory"],
  },
  {
    roomId: "dbms",
    roomCode: "PUBLIC-DBMS",
    title: "DBMS",
    description: "Normalization, SQL, transactions, indexing, and database design.",
    topicLabel: "Database Systems",
    tags: ["DBMS", "SQL", "Transactions"],
  },
  {
    roomId: "dsa",
    roomCode: "PUBLIC-DSA",
    title: "Data Structures",
    description: "Algorithms, graphs, trees, dynamic programming, and contest preparation.",
    topicLabel: "Problem Solving",
    tags: ["DSA", "Graphs", "Contests"],
  },
  {
    roomId: "cn",
    roomCode: "PUBLIC-CN",
    title: "Computer Networks",
    description: "OSI layers, routing, congestion control, and transport protocols.",
    topicLabel: "Computer Networks",
    tags: ["CN", "TCP/IP", "Routing"],
  },
  {
    roomId: "placements",
    roomCode: "PUBLIC-PLACEMENTS",
    title: "Placements",
    description: "Interview prep, company threads, resume reviews, and hiring updates.",
    topicLabel: "Career Prep",
    tags: ["Placements", "Interviews", "Career"],
  },
];

function normalizeIdentity(payload = {}) {
  const email = `${payload.email || ""}`.trim().toLowerCase();
  const name = `${payload.name || email.split("@")[0] || "Guest"}`.trim();
  const userId =
    `${payload.userId || email || name}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
    `user-${uuidv4().slice(0, 8)}`;

  return {
    userId,
    name,
    email: email || `${userId}@studysync.local`,
  };
}

function sanitizeTags(tags = []) {
  return [...new Set(tags.map((tag) => `${tag}`.trim()).filter(Boolean))].slice(0, 8);
}

function topicLabelFromTags(title, tags) {
  return tags[0] || title;
}

async function generateUniqueRoomCode(title) {
  const baseWord =
    title
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .split("-")
      .filter(Boolean)
      .slice(0, 2)
      .join("-") || "ROOM";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const candidate = `${baseWord}-${suffix}`;
    const exists = await Room.exists({ roomCode: candidate });
    if (!exists) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique room code.");
}

function mapMessagePreview(room) {
  return room.lastActivity || "Room created.";
}

function mapRoomResponse(room, viewerId = "") {
  const members = (room.members || []).map((member) => ({
    userId: member.userId,
    name: member.name,
    email: member.email,
    role: member.role,
    joinedAt: member.joinedAt,
  }));

  return {
    roomId: room.roomId,
    roomCode: room.roomCode,
    title: room.title,
    description: room.description,
    scope: room.scope,
    roomType: room.roomType,
    visibility: room.visibility,
    topicLabel: room.topicLabel,
    tags: room.tags || [],
    createdBy: room.createdBy?.userId || "",
    createdByName: room.createdBy?.name || "",
    createdByEmail: room.createdBy?.email || "",
    members,
    memberIds: members.map((member) => member.userId),
    memberCount: members.length,
    viewerIsMember: viewerId ? members.some((member) => member.userId === viewerId) : false,
    joinLink: `${env.clientUrl}/rooms?code=${encodeURIComponent(room.roomCode)}`,
    lastActivity: mapMessagePreview(room),
    nextFocus: room.nextFocus,
    aiRoomReady: Boolean(room.aiRoomReady),
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

async function ensurePublicRooms() {
  const now = new Date();

  for (const room of DEFAULT_PUBLIC_ROOMS) {
    await Room.updateOne(
      { roomId: room.roomId },
      {
        $setOnInsert: {
          roomId: room.roomId,
          room_id: room.roomId,
          roomCode: room.roomCode,
          title: room.title,
          description: room.description,
          scope: "public",
          roomType: "public",
          visibility: "public",
          topicLabel: room.topicLabel,
          tags: room.tags,
          createdBy: {
            userId: "studysync-system",
            name: "StudySync",
            email: "system@studysync.ai",
          },
          members: [],
          nextFocus: "Jump into a live community thread.",
          aiRoomReady: false,
          lastActivity: "Public room is live for global discussion.",
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, timestamps: false },
    );
  }
}

async function createPrivateRoom(payload) {
  const owner = normalizeIdentity(payload.owner);
  const invitedMembers = Array.isArray(payload.members)
    ? payload.members.map((member) => normalizeIdentity(member))
    : [];
  const memberMap = new Map();

  for (const member of [owner, ...invitedMembers]) {
    memberMap.set(member.userId, member);
  }

  const roomId = payload.roomId || `room_${uuidv4().replace(/-/g, "").slice(0, 12)}`;
  const roomCode = await generateUniqueRoomCode(payload.title);
  const tags = sanitizeTags(payload.tags);
  const roomRecord = new Room({
    roomId,
    room_id: roomId,
    roomCode,
    title: payload.title.trim(),
    description: payload.description.trim(),
    scope: "private",
    roomType: "private",
    visibility: "private",
    topicLabel: topicLabelFromTags(payload.title.trim(), tags),
    tags,
    createdBy: owner,
    members: Array.from(memberMap.values()).map((member) => ({
      ...member,
      role: member.userId === owner.userId ? "owner" : "member",
      joinedAt: new Date(),
    })),
    nextFocus: payload.nextFocus || "Upload resources, invite members, and start the room discussion.",
    lastActivity: `${owner.name} created the room.`,
    aiRoomReady: false,
    lastMessageAt: new Date(),
  });

  await roomRecord.save();

  try {
    await syncPrivateRoom(roomRecord);
    roomRecord.aiRoomReady = true;
    await roomRecord.save();
  } catch (error) {
    roomRecord.lastActivity = `${roomRecord.lastActivity} AI sync is pending.`;
    await roomRecord.save();
  }

  return roomRecord;
}

async function listRooms({ scope, memberId }) {
  const filter = {};
  if (scope) {
    filter.scope = scope;
  }
  if (scope === "private" && memberId) {
    filter["members.userId"] = memberId;
  }

  const rooms = await Room.find(filter).sort({ updatedAt: -1 });
  return rooms.map((room) => mapRoomResponse(room, memberId));
}

async function getRoom(roomId) {
  return Room.findOne({ roomId });
}

async function requireRoom(roomId) {
  const room = await getRoom(roomId);
  if (!room) {
    const error = new Error("Room not found.");
    error.status = 404;
    throw error;
  }
  return room;
}

function assertMember(room, userId) {
  if (room.scope === "public") {
    return true;
  }

  if (!userId || !room.members.some((member) => member.userId === userId)) {
    const error = new Error("You have not joined this room.");
    error.status = 403;
    throw error;
  }

  return true;
}

async function getRoomDetail(roomId, viewerId) {
  const room = await requireRoom(roomId);
  assertMember(room, viewerId);
  return mapRoomResponse(room, viewerId);
}

async function joinRoomByCode(payload) {
  const actor = normalizeIdentity(payload.actor);
  const room = await Room.findOne({ roomCode: payload.roomCode.trim().toUpperCase() });

  if (!room) {
    const error = new Error("Invalid room code.");
    error.status = 404;
    throw error;
  }

  if (room.scope !== "private") {
    const error = new Error("Join by code is only available for private rooms.");
    error.status = 400;
    throw error;
  }

  const alreadyMember = room.members.some((member) => member.userId === actor.userId);
  if (!alreadyMember) {
    room.members.push({
      ...actor,
      role: "member",
      joinedAt: new Date(),
    });
    room.lastActivity = `${actor.name} joined using room code ${room.roomCode}.`;
    room.updatedAt = new Date();
    await room.save();
    await syncPrivateRoom(room).catch(() => null);
  }

  return mapRoomResponse(room, actor.userId);
}

async function createInvites(roomId, payload) {
  const actor = normalizeIdentity(payload.actor);
  const room = await requireRoom(roomId);
  assertMember(room, actor.userId);

  const emails = [...new Set((payload.emails || []).map((email) => `${email}`.trim().toLowerCase()).filter(Boolean))];
  if (emails.length === 0) {
    const error = new Error("At least one email is required.");
    error.status = 400;
    throw error;
  }

  const invites = await Promise.all(
    emails.map(async (email) => {
      const invite = new RoomInvite({
        inviteId: `invite_${uuidv4().replace(/-/g, "").slice(0, 12)}`,
        roomId: room.roomId,
        roomCode: room.roomCode,
        roomTitle: room.title,
        invitedEmail: email,
        invitedBy: actor,
        inviteLink: `${env.clientUrl}/rooms?code=${encodeURIComponent(room.roomCode)}`,
        inviteStatus: "logged",
        deliveryMode: "logged",
      });

      await invite.save();
      return invite;
    }),
  );

  room.inviteCount = (room.inviteCount || 0) + invites.length;
  room.lastActivity = `${actor.name} prepared ${invites.length} invite${invites.length > 1 ? "s" : ""}.`;
  room.updatedAt = new Date();
  await room.save();

  return invites.map((invite) => ({
    inviteId: invite.inviteId,
    roomId: invite.roomId,
    roomCode: invite.roomCode,
    roomTitle: invite.roomTitle,
    invitedEmail: invite.invitedEmail,
    invitedBy: invite.invitedBy,
    inviteLink: invite.inviteLink,
    inviteStatus: invite.inviteStatus,
    deliveryMode: invite.deliveryMode,
    createdAt: invite.createdAt,
  }));
}

async function updateRoomActivity(roomId, activity) {
  await Room.updateOne(
    { roomId },
    {
      $set: {
        lastActivity: activity,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );
}

module.exports = {
  DEFAULT_PUBLIC_ROOMS,
  normalizeIdentity,
  mapRoomResponse,
  ensurePublicRooms,
  createPrivateRoom,
  listRooms,
  getRoom,
  getRoomDetail,
  joinRoomByCode,
  createInvites,
  requireRoom,
  assertMember,
  updateRoomActivity,
};
