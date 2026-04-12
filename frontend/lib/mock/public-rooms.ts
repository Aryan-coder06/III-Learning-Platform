export type Channel = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  unread: number;
  topic: string;
};

export type ChannelMessage = {
  id: string;
  channelId: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  date: string;
};

export type ChannelMember = {
  id: string;
  name: string;
  status: "online" | "idle" | "offline";
  role: "admin" | "moderator" | "member";
};

export const publicChannels: Channel[] = [
  {
    id: "os",
    name: "operating-systems",
    description: "Discuss process scheduling, memory management, file systems, and OS internals",
    memberCount: 234,
    unread: 5,
    topic: "OS",
  },
  {
    id: "dbms",
    name: "dbms",
    description: "Relational algebra, SQL queries, normalization, transactions, and indexing",
    memberCount: 198,
    unread: 3,
    topic: "DBMS",
  },
  {
    id: "dsa",
    name: "data-structures",
    description: "Arrays, trees, graphs, dynamic programming, and competitive coding",
    memberCount: 412,
    unread: 12,
    topic: "DSA",
  },
  {
    id: "cn",
    name: "computer-networks",
    description: "OSI layers, TCP/IP, subnetting, routing protocols, and network security",
    memberCount: 156,
    unread: 0,
    topic: "CN",
  },
  {
    id: "ml",
    name: "machine-learning",
    description: "Regression, classification, neural networks, and model evaluation techniques",
    memberCount: 287,
    unread: 8,
    topic: "ML",
  },
  {
    id: "se",
    name: "software-engineering",
    description: "SDLC, agile, design patterns, UML diagrams, and project management",
    memberCount: 143,
    unread: 1,
    topic: "SE",
  },
  {
    id: "general",
    name: "general",
    description: "Off-topic conversations, introductions, and community announcements",
    memberCount: 520,
    unread: 0,
    topic: "General",
  },
  {
    id: "placements",
    name: "placements",
    description: "Interview prep, company-specific threads, resume reviews, and placement experiences",
    memberCount: 367,
    unread: 2,
    topic: "Placements",
  },
];

export const channelMessages: Record<string, ChannelMessage[]> = {
  os: [
    {
      id: "os-1",
      channelId: "os",
      sender: "Priya Sharma",
      avatar: "PS",
      content: "Can someone explain the difference between preemptive and non-preemptive scheduling? I keep confusing SRTF with SJF.",
      time: "2:34 PM",
      date: "Today",
    },
    {
      id: "os-2",
      channelId: "os",
      sender: "Rahul Mehta",
      avatar: "RM",
      content: "Sure! In preemptive scheduling, the CPU can be taken away from a process if a higher-priority process arrives. SJF is non-preemptive (runs to completion), while SRTF is the preemptive version — it switches if a new process with shorter remaining time arrives.",
      time: "2:38 PM",
      date: "Today",
    },
    {
      id: "os-3",
      channelId: "os",
      sender: "Ankit Verma",
      avatar: "AV",
      content: "Just solved the Banker's Algorithm problem from the last assignment. The trick is to check if the remaining need of every process can be satisfied by the available resources before marking it as \"finished\".",
      time: "3:12 PM",
      date: "Today",
    },
    {
      id: "os-4",
      channelId: "os",
      sender: "Sneha Gupta",
      avatar: "SG",
      content: "Does anyone have notes on page replacement algorithms? Specifically LRU vs Optimal — I need to compare their page fault rates for the mid-sem.",
      time: "4:05 PM",
      date: "Today",
    },
  ],
  dbms: [
    {
      id: "dbms-1",
      channelId: "dbms",
      sender: "Karan Singh",
      avatar: "KS",
      content: "Quick question — is BCNF always stricter than 3NF? When does a 3NF table NOT satisfy BCNF?",
      time: "11:20 AM",
      date: "Today",
    },
    {
      id: "dbms-2",
      channelId: "dbms",
      sender: "Neha Patel",
      avatar: "NP",
      content: "Yes, BCNF is stricter. A 3NF table fails BCNF when a non-trivial FD has a determinant that is not a superkey. Classic example: a table with overlapping candidate keys.",
      time: "11:25 AM",
      date: "Today",
    },
    {
      id: "dbms-3",
      channelId: "dbms",
      sender: "Amit Roy",
      avatar: "AR",
      content: "Shared some practice SQL queries in the documents section. Covers joins, subqueries, and GROUP BY with HAVING. Check it out before the lab exam!",
      time: "1:00 PM",
      date: "Today",
    },
  ],
  dsa: [
    {
      id: "dsa-1",
      channelId: "dsa",
      sender: "Vikram Joshi",
      avatar: "VJ",
      content: "Solved 5 graph problems today — BFS, DFS, Dijkstra, Bellman-Ford, and Floyd-Warshall. Feeling confident about the test!",
      time: "10:00 AM",
      date: "Today",
    },
    {
      id: "dsa-2",
      channelId: "dsa",
      sender: "Riya Das",
      avatar: "RD",
      content: "Can someone explain when to use top-down memoization vs bottom-up tabulation in DP? I always default to recursion but my solutions TLE.",
      time: "10:45 AM",
      date: "Today",
    },
  ],
  cn: [
    {
      id: "cn-1",
      channelId: "cn",
      sender: "Deepak Kumar",
      avatar: "DK",
      content: "Can we discuss the differences between TCP and UDP for the upcoming test? I've made a comparison chart if anyone wants it.",
      time: "9:30 AM",
      date: "Today",
    },
  ],
  ml: [
    {
      id: "ml-1",
      channelId: "ml",
      sender: "Aisha Khan",
      avatar: "AK",
      content: "Just finished implementing linear regression from scratch in Python. The gradient descent converges much faster with feature normalization!",
      time: "3:00 PM",
      date: "Today",
    },
    {
      id: "ml-2",
      channelId: "ml",
      sender: "Rohan Tiwari",
      avatar: "RT",
      content: "Has anyone tried using scikit-learn's GridSearchCV for hyperparameter tuning? The results for my SVM classifier improved by 8% accuracy.",
      time: "3:45 PM",
      date: "Today",
    },
  ],
  se: [
    {
      id: "se-1",
      channelId: "se",
      sender: "Meera Iyer",
      avatar: "MI",
      content: "Uploaded the UML class diagram for our group project. Please review and add your associations before tomorrow's review.",
      time: "5:00 PM",
      date: "Today",
    },
  ],
  general: [
    {
      id: "gen-1",
      channelId: "general",
      sender: "Admin",
      avatar: "AD",
      content: "Welcome to StudySync Public Rooms! Use channels to discuss subjects, share resources, and collaborate with the community. Tag @StudyBuddy for AI-powered help.",
      time: "9:00 AM",
      date: "Monday",
    },
  ],
  placements: [
    {
      id: "plc-1",
      channelId: "placements",
      sender: "Arjun Nair",
      avatar: "AN",
      content: "Microsoft SDE intern interview experience: 1 DSA round (medium LC), 1 system design discussion, 1 behavioral. Prep your OS and DBMS basics too — they asked about deadlocks!",
      time: "6:30 PM",
      date: "Today",
    },
    {
      id: "plc-2",
      channelId: "placements",
      sender: "Pooja Reddy",
      avatar: "PR",
      content: "Google STEP applications open next week. Make sure your resume highlights projects with scale. Happy to review resumes — just DM me!",
      time: "7:15 PM",
      date: "Today",
    },
  ],
};

export const channelMembers: Record<string, ChannelMember[]> = {
  os: [
    { id: "u1", name: "Priya Sharma", status: "online", role: "admin" },
    { id: "u2", name: "Rahul Mehta", status: "online", role: "moderator" },
    { id: "u3", name: "Ankit Verma", status: "idle", role: "member" },
    { id: "u4", name: "Sneha Gupta", status: "online", role: "member" },
    { id: "u5", name: "Arjun Nair", status: "offline", role: "member" },
    { id: "u6", name: "Meera Iyer", status: "offline", role: "member" },
  ],
  dbms: [
    { id: "u7", name: "Karan Singh", status: "online", role: "admin" },
    { id: "u8", name: "Neha Patel", status: "online", role: "member" },
    { id: "u9", name: "Amit Roy", status: "idle", role: "member" },
    { id: "u10", name: "Riya Das", status: "offline", role: "member" },
  ],
  dsa: [
    { id: "u11", name: "Vikram Joshi", status: "online", role: "admin" },
    { id: "u12", name: "Riya Das", status: "online", role: "member" },
    { id: "u13", name: "Deepak Kumar", status: "idle", role: "member" },
  ],
  cn: [
    { id: "u14", name: "Deepak Kumar", status: "online", role: "admin" },
    { id: "u15", name: "Pooja Reddy", status: "offline", role: "member" },
  ],
  ml: [
    { id: "u16", name: "Aisha Khan", status: "online", role: "admin" },
    { id: "u17", name: "Rohan Tiwari", status: "online", role: "member" },
  ],
  se: [
    { id: "u18", name: "Meera Iyer", status: "online", role: "admin" },
  ],
  general: [
    { id: "u0", name: "Admin", status: "online", role: "admin" },
    { id: "u1", name: "Priya Sharma", status: "online", role: "member" },
    { id: "u7", name: "Karan Singh", status: "idle", role: "member" },
  ],
  placements: [
    { id: "u5", name: "Arjun Nair", status: "online", role: "admin" },
    { id: "u19", name: "Pooja Reddy", status: "online", role: "moderator" },
    { id: "u20", name: "Vikram Joshi", status: "idle", role: "member" },
  ],
};
