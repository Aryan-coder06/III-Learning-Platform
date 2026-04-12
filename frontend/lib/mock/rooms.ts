export type RoomMember = {
  id: string;
  name: string;
  role: string;
  accent: string;
};

export type RoomDiscussionEntry = {
  id: string;
  authorId: string;
  authorType: "member" | "bot" | "system";
  authorLabel?: string;
  content: string;
  createdAt: string;
  sources?: Array<{
    chunkId: string;
    filename: string;
    pageNumber: number;
    excerpt: string;
  }>;
};

export type RoomResourcePreview = {
  id: string;
  name: string;
  type: string;
  status: "indexed" | "pending" | "uploaded";
  updatedAt: string;
};

export type RoomActivityEntry = {
  id: string;
  label: string;
  createdAt: string;
};

export type PrivateRoom = {
  roomId: string;
  title: string;
  description: string;
  roomType: "private";
  visibility: "private";
  createdBy: string;
  memberIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  topicLabel: string;
  lastActivity: string;
  nextFocus: string;
  backendReady: boolean;
  discussion: RoomDiscussionEntry[];
  resources: RoomResourcePreview[];
  activity: RoomActivityEntry[];
};

export const memberDirectory: RoomMember[] = [
  { id: "user-aryan", name: "Aryan", role: "You", accent: "bg-accent text-accent-foreground" },
  { id: "user-rina", name: "Rina", role: "Systems notes", accent: "bg-sidebar text-sidebar-foreground" },
  { id: "user-nisha", name: "Nisha", role: "Problem solving", accent: "bg-secondary text-foreground" },
  { id: "user-kabir", name: "Kabir", role: "Project execution", accent: "bg-[#ffe9e2] text-accent" },
  { id: "user-zara", name: "Zara", role: "Revision partner", accent: "bg-[#ece8df] text-foreground" },
];

export const seededPrivateRooms: PrivateRoom[] = [
  {
    roomId: "room-os-core",
    title: "OS Deadlock Core",
    description:
      "A focused private room for deadlocks, memory allocation, and high-yield operating systems revision.",
    roomType: "private",
    visibility: "private",
    createdBy: "user-aryan",
    memberIds: ["user-aryan", "user-rina", "user-zara"],
    tags: ["OS", "Deadlocks", "Midsem"],
    createdAt: "2026-04-09T09:00:00.000Z",
    updatedAt: "2026-04-12T11:30:00.000Z",
    topicLabel: "Operating Systems",
    lastActivity: "Rina uploaded memory-allocation-revision.pdf 42m ago",
    nextFocus: "Deadlock prevention walkthrough · Today · 7:30 PM",
    backendReady: false,
    discussion: [
      {
        id: "discussion-os-1",
        authorId: "user-rina",
        authorType: "member",
        content: "Pinned the banker’s algorithm walkthrough and highlighted the unsafe-state example on page 11.",
        createdAt: "42m ago",
      },
      {
        id: "discussion-os-2",
        authorId: "user-zara",
        authorType: "member",
        content: "Let’s use the knowledge tab for deadlock prevention and resource-allocation graph questions tonight.",
        createdAt: "1h ago",
      },
    ],
    resources: [
      {
        id: "resource-os-1",
        name: "memory-allocation-revision.pdf",
        type: "PDF",
        status: "uploaded",
        updatedAt: "Today",
      },
      {
        id: "resource-os-2",
        name: "deadlock-notes.md",
        type: "Notes",
        status: "indexed",
        updatedAt: "Yesterday",
      },
    ],
    activity: [
      {
        id: "activity-os-1",
        label: "Knowledge workspace reserved for room-scoped PDF indexing and grounded answers.",
        createdAt: "Just now",
      },
      {
        id: "activity-os-2",
        label: "Discussion thread updated with banker’s algorithm examples.",
        createdAt: "42m ago",
      },
    ],
  },
  {
    roomId: "room-dbms-rag",
    title: "DBMS Normalization Sprint",
    description:
      "Private prep room for normalization, transactions, and concise database systems recall.",
    roomType: "private",
    visibility: "private",
    createdBy: "user-aryan",
    memberIds: ["user-aryan", "user-nisha", "user-kabir"],
    tags: ["DBMS", "Normalization", "Transactions"],
    createdAt: "2026-04-08T07:45:00.000Z",
    updatedAt: "2026-04-12T09:15:00.000Z",
    topicLabel: "Database Systems",
    lastActivity: "Kabir reorganized query examples and index notes 2h ago",
    nextFocus: "3NF and BCNF recap · Tomorrow · 5:00 PM",
    backendReady: false,
    discussion: [
      {
        id: "discussion-db-1",
        authorId: "user-kabir",
        authorType: "member",
        content: "Added a short checklist for deciding when decomposition preserves dependencies.",
        createdAt: "2h ago",
      },
      {
        id: "discussion-db-2",
        authorId: "user-nisha",
        authorType: "member",
        content: "Need a room-specific query for ‘find where normalization is explained in our DBMS notes’.",
        createdAt: "Yesterday",
      },
    ],
    resources: [
      {
        id: "resource-db-1",
        name: "normalization-cheatsheet.pdf",
        type: "PDF",
        status: "pending",
        updatedAt: "Today",
      },
      {
        id: "resource-db-2",
        name: "transaction-schedules.pdf",
        type: "PDF",
        status: "uploaded",
        updatedAt: "Apr 11",
      },
    ],
    activity: [
      {
        id: "activity-db-1",
        label: "New private room questions queued for future grounded retrieval.",
        createdAt: "2h ago",
      },
    ],
  },
  {
    roomId: "room-hackathon-engine",
    title: "Hackathon Engine Room",
    description:
      "Execution room for shipping StudySync with fast notes, architecture decisions, and room-specific demos.",
    roomType: "private",
    visibility: "private",
    createdBy: "user-aryan",
    memberIds: ["user-aryan", "user-kabir", "user-rina", "user-nisha"],
    tags: ["Hackathon", "Execution", "Frontend"],
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-12T12:00:00.000Z",
    topicLabel: "Product build",
    lastActivity: "Architecture board updated and dashboard shell tightened 18m ago",
    nextFocus: "RAG foundation pass · Tonight · 9:00 PM",
    backendReady: false,
    discussion: [
      {
        id: "discussion-hack-1",
        authorId: "user-aryan",
        authorType: "member",
        content: "Private rooms are now the first serious surface. Knowledge indexing should attach here first.",
        createdAt: "18m ago",
      },
      {
        id: "discussion-hack-2",
        authorId: "user-kabir",
        authorType: "member",
        content: "Sidebar collapse and room detail shell need to stay dense and product-like.",
        createdAt: "27m ago",
      },
    ],
    resources: [
      {
        id: "resource-hack-1",
        name: "studysync-architecture-v3.pdf",
        type: "PDF",
        status: "uploaded",
        updatedAt: "Today",
      },
    ],
    activity: [
      {
        id: "activity-hack-1",
        label: "Private room cards promoted to dashboard priority surface.",
        createdAt: "18m ago",
      },
      {
        id: "activity-hack-2",
        label: "RAG-first backend contract drafted for room-scoped retrieval.",
        createdAt: "1h ago",
      },
    ],
  },
];

export function getMemberById(memberId: string) {
  return memberDirectory.find((member) => member.id === memberId);
}
