// data.js
// Embedded seed database for demo mode.
// Edit this file to add seeded profiles/messages before publishing.

const DB = {
  profiles: [
    {
      id: "user_alice",
      slug: "alice",
      displayName: "alice",
      avatar: "🌸",
      createdAt: "2025-10-22T00:00:00Z",
      ownerKey: "owner_alice_demo_abc123"
    },
    {
      id: "user_dev",
      slug: "dev",
      displayName: "dev",
      avatar: "⚙️",
      createdAt: "2025-10-22T00:00:00Z",
      ownerKey: "owner_dev_demo_zzz999"
    }
  ],
  messages: [
    {
      id: "msg_001",
      profileId: "user_alice",
      text: "You're doing great — keep going! 😊",
      createdAt: "2025-10-22T02:12:00Z",
      deleted: false,
      likes: 3,
      category: "compliment"
    },
    {
      id: "msg_002",
      profileId: "user_alice",
      text: "What's your favorite hobby?",
      createdAt: "2025-10-22T03:50:00Z",
      deleted: false,
      likes: 1,
      category: "question"
    },
    {
      id: "msg_003",
      profileId: "user_dev",
      text: "Love this demo! Could you add a dark-mode toggle?",
      createdAt: "2025-10-22T05:00:00Z",
      deleted: false,
      likes: 2,
      category: "feedback"
    }
  ],
  config: {
    messageMaxLength: 400,
    profanityList: ["fuck","shit","bitch","asshole"] // client-side basic filter (lowercase)
  }
};
