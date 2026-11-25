// Initial seed data for JustFans Creator Subscription & Video Platform

export const mockUsers = [
  {
    id: "user-fan-1",
    username: "alex_fan",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "fan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Passionate supporter of indie creators, digital art & electronic music.",
    walletBalance: 125.50,
    following: ["creator-1", "creator-2", "creator-3"],
    subscriptions: [
      { creatorId: "creator-2", tier: "Standard", expiresAt: "2026-11-28", price: 9.99 }
    ],
    bookmarks: ["post-1", "post-4"]
  },
  {
    id: "creator-1",
    username: "uni_ques78",
    name: "Nicole Shayla",
    email: "nicole@justfans.io",
    role: "creator",
    avatar: "/FhNtifmVQAEZDgwy.jpg",
    banner: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1400&auto=format&fit=crop&q=80",
    category: "Trans & Solo VIP",
    bio: "FREE OF❗9 INCH COCK & I LOVE TAKING IT TOO 😈 23 y trans girl from the US & anal queen of your dreams 💦i’m horny 24/7 and yeah",
    subscriberCount: 5240,
    postCount: 24,
    likeCount: 112000,
    monthlyPrice: 60.00,
    vipPrice: 99.00,
    verified: true,
    tiers: [
      {
        id: "tier-nicole-std",
        name: "Standard Fan",
        price: 60.00,
        perks: [
          "Full access to 4K uncensored video vault & feed",
          "Daily video drops & private feed",
          "Comment & like privileges on all posts"
        ]
      },
      {
        id: "tier-nicole-vip",
        name: "VIP All-Access",
        price: 99.00,
        perks: [
          "All Standard Fan perks",
          "Direct priority 1-on-1 private messaging",
          "Exclusive custom video requests discount",
          "Early access to full uncut 4K tapes"
        ]
      }
    ]
  },
  {
    id: "creator-2",
    username: "chloe_rose",
    name: "Chloe Rose 🏳️‍⚧️",
    email: "chloe@justfans.io",
    role: "creator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80",
    category: "Trans & TS Goddesses",
    bio: "22y Trans Glamour Model & Solo Queen 🏳️‍⚧️ Uncensored 4K solo tapes, girlfriend experience (GFE), lingerie try-ons, and intimate private DMs. New drops every Wednesday! 💋",
    subscriberCount: 2310,
    postCount: 88,
    likeCount: 41200,
    monthlyPrice: 25.00,
    vipPrice: 45.00,
    verified: true,
    tiers: [
      {
        id: "tier-chloe-std",
        name: "VIP Solo Pass",
        price: 25.00,
        perks: [
          "Access to full uncut 4K video catalog",
          "Weekly new solo drops & photo sets",
          "Direct fan messaging privileges"
        ]
      },
      {
        id: "tier-chloe-vip",
        name: "All-Access Goddess",
        price: 45.00,
        perks: [
          "All VIP Solo Pass perks",
          "Exclusive behind-the-scenes & uncensored clips",
          "Priority reply in private DMs"
        ]
      }
    ]
  },
  {
    id: "creator-3",
    username: "sashafox_vip",
    name: "Sasha Fox 🎀",
    email: "sasha@justfans.io",
    role: "creator",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
    category: "Cosplay & Alt Glamour",
    bio: "21y Petite E-Girl & Alt Model 💕 4K anime & gaming cosplay try-ons, teasing solo sessions, and private Snapchat. Custom clip requests open!",
    subscriberCount: 3670,
    postCount: 110,
    likeCount: 68100,
    monthlyPrice: 30.00,
    vipPrice: 50.00,
    verified: true,
    tiers: [
      {
        id: "tier-sasha-std",
        name: "Fan Access",
        price: 30.00,
        perks: [
          "Full 4K cosplay photo galleries & video teasers",
          "Monthly themed exclusive wallpaper sets",
          "Private community feed access"
        ]
      }
    ]
  },
  {
    id: "creator-4",
    username: "mayalin_ts",
    name: "Maya Lin 🏳️‍⚧️💋",
    email: "maya@justfans.io",
    role: "creator",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&auto=format&fit=crop&q=80",
    category: "Trans & TS Goddesses",
    bio: "23y Exotic TS Creator & Solo Star 🏳️‍⚧️ 100% Raw, uncut 4K tapes, POV morning shower sessions, and interactive toy play. Message me for direct customs!",
    subscriberCount: 1940,
    postCount: 65,
    likeCount: 29500,
    monthlyPrice: 35.00,
    vipPrice: 60.00,
    verified: true,
    tiers: [
      {
        id: "tier-maya-std",
        name: "Solo Access",
        price: 35.00,
        perks: [
          "Weekly uncut 4K solo session drops",
          "High-res uncensored photo sets",
          "Exclusive custom video request access"
        ]
      }
    ]
  }
];

export const mockPosts = [
  {
    id: "post-1",
    creatorId: "creator-1",
    title: "Welcome to My Official VIP Fan Club 💋✨ [Free Intro Trailer]",
    caption: "Hey loves! Welcome to my private world 💕 Here you get uncensored full-length 4K videos, behind-the-scenes vlogs, and direct 1-on-1 private DMs with me. Subscribe below to unlock my entire vault!",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    isLocked: false,
    requiredTier: "free",
    priceToUnlock: 0,
    likes: 2480,
    commentsCount: 142,
    tipsTotal: 380,
    createdAt: "2026-11-05T08:30:00Z",
    tags: ["Welcome", "FreeTrailer", "NicoleShayla"],
    comments: [
      { id: "c1", user: "alex_fan", text: "So excited you launched your official site Nicole! Subscribed immediately 🔥", createdAt: "2026-11-05T09:10:00Z" },
      { id: "c2", user: "sam_vip", text: "You look stunning queen! Can't wait for tonight's tape 💦", createdAt: "2026-11-05T10:00:00Z" }
    ]
  },
  {
    id: "post-2",
    creatorId: "creator-1",
    title: "EXCLUSIVE: Bedroom Solo Session & Tease 💦 [Subscribers Only]",
    caption: "Unfiltered 4K bedroom tape just dropped for all my active VIP subscribers! Turn up your volume 😈",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    isLocked: true,
    requiredTier: "Standard Fan",
    priceToUnlock: 18.66,
    likes: 4210,
    commentsCount: 310,
    tipsTotal: 890,
    createdAt: "2026-11-04T16:00:00Z",
    tags: ["VIPExclusive", "4KVideo", "BedroomSession"],
    comments: [
      { id: "c3", user: "fit_mike", text: "Worth every single penny of the subscription. Absolutely insane.", createdAt: "2026-11-04T18:22:00Z" }
    ]
  },
  {
    id: "post-vault-1",
    creatorId: "creator-1",
    title: "PREMIUM VAULT: Full 25-Min Uncut 4K Anal Queen Tape 🔥 [PPV Exclusive]",
    caption: "My wildest, most requested full-length tape. Raw, intense, and 100% uncut. Unlock to watch immediately!",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    isLocked: true,
    requiredTier: "VIP All-Access",
    priceToUnlock: 24.50,
    likes: 5690,
    commentsCount: 418,
    tipsTotal: 1450,
    createdAt: "2026-11-03T12:00:00Z",
    tags: ["PPVExclusive", "UncutTape", "4KAnalQueen"],
    comments: [
      { id: "c4", user: "alex_fan", text: "Best tape on the internet, 10/10 🔥🔥🔥", createdAt: "2026-11-03T13:40:00Z" }
    ]
  },
  {
    id: "post-3",
    creatorId: "creator-2",
    title: "Late Night Silk Robe Tease & 4K Bedroom Solo 💋 [VIP Exclusive]",
    caption: "Unfiltered 4K solo session in my favorite lace robe. Free for all my active VIP subscribers! Let me know what you think in the comments babe 💕",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    isLocked: true,
    requiredTier: "VIP Solo Pass",
    priceToUnlock: 6.99,
    likes: 1842,
    commentsCount: 94,
    tipsTotal: 280,
    createdAt: "2026-11-03T20:15:00Z",
    tags: ["TransQueen", "SoloTape", "4KExclusive"],
    comments: [
      { id: "c4", user: "alex_fan", text: "You look absolutely incredible Chloe! 💖", createdAt: "2026-11-04T01:10:00Z" }
    ]
  },
  {
    id: "post-4",
    creatorId: "creator-3",
    title: "Cyberpunk Bunny Cosplay & Lingerie Try-On [Free Preview] 🎀",
    caption: "Sharing a free teaser from this weekend's cyberpunk shoot! Full 35-photo 4K gallery unlocked for subscribers.",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    isLocked: false,
    requiredTier: "free",
    priceToUnlock: 0,
    likes: 2950,
    commentsCount: 182,
    tipsTotal: 510,
    createdAt: "2026-11-02T14:40:00Z",
    tags: ["Cosplay", "Egirl", "Tease"],
    comments: [
      { id: "c5", user: "artlover_9", text: "The outfit and makeup are perfection! 💕", createdAt: "2026-11-02T15:00:00Z" }
    ]
  },
  {
    id: "post-5",
    creatorId: "creator-4",
    title: "POV Morning Shower & Dirty Talk (4K 60FPS) 🚿💋",
    caption: "Start your morning with an intimate POV shower session. Uncensored, steamy, and raw. Message me for direct customs!",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    isLocked: true,
    requiredTier: "Solo Access",
    priceToUnlock: 9.99,
    likes: 1720,
    commentsCount: 118,
    tipsTotal: 340,
    createdAt: "2026-11-01T11:00:00Z",
    tags: ["POV", "GFE", "TransGoddess"],
    comments: []
  }
];

export const mockMessages = [
  {
    id: "thread-1",
    creatorId: "creator-1",
    fanId: "user-fan-1",
    messages: [
      {
        id: "m-welcome-1",
        senderId: "creator-1",
        text: "Hey babe! 💕 Welcome to my exclusive VIP chat. If you're looking to subscribe ($60/mo) and unlock my full uncut 4K video vault, message me right here to get my approved CashApp, Gift Cards, or Crypto details! 😈 Let me know what payment method works best for you!",
        timestamp: "2026-11-15T10:00:00Z",
        tip: 0
      },
      {
        id: "m-fan-1",
        senderId: "user-fan-1",
        text: "Hey Nicole! What payment method can I use to unlock the monthly VIP pass?",
        timestamp: "2026-11-15T10:15:00Z",
        tip: 5.00
      },
      {
        id: "m-nicole-1",
        senderId: "creator-1",
        text: "Hey Alex! Thank you so much for the tip! 💕 You can send your $60 directly via CashApp, Gift Cards (Apple/Steam/Amazon/Visa), or Crypto (USDT). Reply here once sent so I can verify and activate your full vault access! 💋",
        timestamp: "2026-11-15T10:30:00Z",
        tip: 0
      }
    ]
  }
];

