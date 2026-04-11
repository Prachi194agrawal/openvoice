const now = new Date();

export const mockUser = {
  id: "demo-user",
  name: "Demo Student",
  email: "demo@iiitm.ac.in",
  role: "ADMIN" as const,
};

export const mockPosts = [
  {
    id: "demo-post-1",
    title: "Internship opening thread - Summer 2026",
    body: "Share internship opportunities and preparation tips for everyone in IIITM.",
    imageUrl: null as string | null,
    tags: ["careers", "internships"],
    hashtags: ["placement-prep", "summer-2026"],
    createdAt: new Date(now.getTime() - 1000 * 60 * 45),
    author: { name: "Ananya" },
    reactions: [{ value: "UPVOTE" as const, userId: "demo-user" }, { value: "UPVOTE" as const, userId: "u2" }],
    _count: { comments: 3 },
  },
  {
    id: "demo-post-2",
    title: "Mess feedback: weekly menu ideas",
    body: "Let's collect suggestions and send one consolidated request to the admin office.",
    imageUrl: null as string | null,
    tags: ["mess", "feedback"],
    hashtags: ["hostel-updates", "food"],
    createdAt: new Date(now.getTime() - 1000 * 60 * 180),
    author: { name: "Rohit" },
    reactions: [{ value: "UPVOTE" as const, userId: "u3" }, { value: "DOWNVOTE" as const, userId: "u4" }],
    _count: { comments: 2 },
  },
];

export const mockComments = [
  {
    id: "c1",
    body: "Great idea, we should pin this.",
    createdAt: new Date(now.getTime() - 1000 * 60 * 40),
    parentId: null,
    postId: "demo-post-1",
    author: { name: "Tanya" },
    reactions: [{ value: "UPVOTE" as const, userId: "demo-user" }],
  },
  {
    id: "c2",
    body: "Agreed, also add referral links.",
    createdAt: new Date(now.getTime() - 1000 * 60 * 30),
    parentId: "c1",
    postId: "demo-post-1",
    author: { name: "Arun" },
    reactions: [{ value: "UPVOTE" as const, userId: "u2" }],
  },
];

export const mockReports = [
  {
    id: "r1",
    reason: "Contains personal attack",
    status: "PENDING",
    reporter: { id: "u7", name: "Student A", email: "studentA@iiitm.ac.in" },
    post: { id: "demo-post-2", title: "Mess feedback: weekly menu ideas" },
    comment: null,
  },
];
