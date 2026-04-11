export const demoUser = {
  name: "Aryan",
  email: "demo@studysync.ai",
  role: "Demo user",
};

export const dashboardStats = [
  { label: "Active Rooms", value: "06", detail: "+2 this week" },
  { label: "Pending Reminders", value: "04", detail: "2 due today" },
  { label: "Shared Files", value: "28", detail: "7 updated recently" },
  { label: "Upcoming Sessions", value: "03", detail: "Next in 45 min" },
  { label: "New Messages", value: "19", detail: "5 unread threads" },
  { label: "Weekly Study Hours", value: "14.5", detail: "Goal: 18 hrs" },
];

export const joinedRooms = [
  {
    name: "DSA Sprint Room",
    topic: "Algorithms and problem solving",
    members: 8,
    status: "Live now",
    nextSession: "Today · 7:30 PM",
  },
  {
    name: "OS Midsem Prep",
    topic: "Processes, memory, and scheduling",
    members: 5,
    status: "Preparing notes",
    nextSession: "Tomorrow · 5:00 PM",
  },
  {
    name: "Capstone Sync",
    topic: "Project execution and demo planning",
    members: 4,
    status: "Session scheduled",
    nextSession: "Apr 12 · 11:00 AM",
  },
];

export const conversationPreview = [
  {
    room: "DSA Sprint Room",
    unread: 4,
    lastMessage: "Shared a cleaner graph traversal breakdown for problem 3.",
    sender: "Nisha",
    time: "4m ago",
  },
  {
    room: "Capstone Sync",
    unread: 1,
    lastMessage: "Let’s lock the dashboard story before tonight’s dry run.",
    sender: "Kabir",
    time: "18m ago",
  },
  {
    room: "OS Midsem Prep",
    unread: 0,
    lastMessage: "Uploaded the final paging notes deck.",
    sender: "Zara",
    time: "1h ago",
  },
];

export const recentFiles = [
  {
    name: "memory-management-revision.pdf",
    uploader: "Rina",
    room: "OS Midsem Prep",
    date: "Apr 11",
  },
  {
    name: "dsa-mock-questions-v2.docx",
    uploader: "Nisha",
    room: "DSA Sprint Room",
    date: "Apr 10",
  },
  {
    name: "capstone-demo-outline.fig",
    uploader: "Kabir",
    room: "Capstone Sync",
    date: "Apr 10",
  },
];

export const upcomingSessions = [
  {
    room: "DSA Sprint Room",
    topic: "Greedy and Graph Revision",
    datetime: "Today · 7:30 PM",
    participants: 8,
  },
  {
    room: "Capstone Sync",
    topic: "Hackathon milestone check-in",
    datetime: "Apr 12 · 11:00 AM",
    participants: 4,
  },
];

export const reminders = [
  {
    title: "Review mock interview sheet",
    status: "Due in 2 hours",
  },
  {
    title: "Respond to capstone session notes",
    status: "Missed yesterday",
  },
  {
    title: "Upload whiteboard summary",
    status: "Due tomorrow",
  },
];

export const activityFeed = [
  "Kabir scheduled a capstone sync for Apr 12 at 11:00 AM.",
  "Nisha uploaded a new DSA revision file to DSA Sprint Room.",
  "Rina created a whiteboard sketch for memory allocation strategies.",
  "A new discussion thread started in OS Midsem Prep.",
];
