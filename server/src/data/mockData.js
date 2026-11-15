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
    username: "marcus_beats",
    name: "Marcus Cole",
    email: "marcus@justfans.io",
    role: "creator",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
    category: "Music & Production",
    bio: "Synthwave & Lo-Fi Producer 🎧 Ableton Masterclasses, sample packs, and unreleased stems every single Friday.",
    subscriberCount: 2310,
    postCount: 88,
    likeCount: 41200,
    monthlyPrice: 9.99,
    vipPrice: 19.99,
    verified: true,
    tiers: [
      {
        id: "tier-marcus-std",
        name: "Beat Club",
        price: 9.99,
        perks: [
          "Access to full unreleased music catalog",
          "High-res WAV audio downloads",
          "Song breakdown video series"
        ]
      },
      {
        id: "tier-marcus-vip",
        name: "Producer Mastermind",
        price: 19.99,
        perks: [
          "All Beat Club perks",
          "Royalty-free monthly sample pack & MIDI files",
          "Track review in private live stream"
        ]
      }
    ]
  },
  {
    id: "creator-3",
    username: "elena_art",
    name: "Elena Rostova",
    email: "elena@justfans.io",
    role: "creator",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    category: "Digital Art & 3D",
    bio: "Concept Artist & Blender Sculptor 🎨 Fantasy worlds, speed-paint timelapses, and 3D printable assets.",
    subscriberCount: 3670,
    postCount: 110,
    likeCount: 68100,
    monthlyPrice: 12.00,
    vipPrice: 24.00,
    verified: true,
    tiers: [
      {
        id: "tier-elena-std",
        name: "Art Enthusiast",
        price: 12.00,
        perks: [
          "Full 4K digital artwork wallpapers",
          "Layered PSD & Procreate brush sets",
          "Time-lapse video tutorials"
        ]
      }
    ]
  },
  {
    id: "creator-4",
    username: "cyber_kai",
    name: "Kai Vance",
    email: "kai@justfans.io",
    role: "creator",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    category: "Tech & Gaming",
    bio: "Hardware overclocking, mechanical keyboards, and private game server tournaments 🕹️",
    subscriberCount: 1940,
    postCount: 65,
    likeCount: 29500,
    monthlyPrice: 8.50,
    vipPrice: 18.00,
    verified: true,
    tiers: [
      {
        id: "tier-kai-std",
        name: "Gamer Tier",
        price: 8.50,
        perks: [
          "Private Discord access",
          "Stream VODs without ads",
          "Monthly PC build giveaway entry"
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
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
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
    title: "Deconstructing My Tokyo Nights Synth Track (Full Project Stems Inside)",
    caption: "Here is the master session breakdown: how I layered the vintage analog synths and processed the bassline with saturation.",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
    isLocked: true,
    requiredTier: "Beat Club",
    priceToUnlock: 6.99,
    likes: 842,
    commentsCount: 64,
    tipsTotal: 180,
    createdAt: "2026-11-03T20:15:00Z",
    tags: ["MusicProduction", "Ableton", "Synthwave"],
    comments: [
      { id: "c4", user: "audio_nerd", text: "The sidechain compression tip on the snare changed everything for me.", createdAt: "2026-11-04T01:10:00Z" }
    ]
  },
  {
    id: "post-4",
    creatorId: "creator-3",
    title: "Neon Dragon: 8-Hour Digital Painting Timelapse in 4K 🐉",
    caption: "Sharing the raw speedpaint from start to finish with commentary on lighting, color balance, and perspective grids.",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    isLocked: false,
    requiredTier: "free",
    priceToUnlock: 0,
    likes: 1950,
    commentsCount: 142,
    tipsTotal: 410,
    createdAt: "2026-11-02T14:40:00Z",
    tags: ["DigitalArt", "ConceptArt", "Timelapse"],
    comments: [
      { id: "c5", user: "artlover_9", text: "The color palette in the scales is breathtaking!", createdAt: "2026-11-02T15:00:00Z" }
    ]
  },
  {
    id: "post-5",
    creatorId: "creator-4",
    title: "Liquid-Cooled Monster Rig: 4090 Overclock Test + Benchmark",
    caption: "Pushed the clocks 25% beyond factory specs. Thermals held under 58°C with dual 360mm radiators. Benchmark graphs attached!",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    isLocked: false,
    requiredTier: "free",
    priceToUnlock: 0,
    likes: 720,
    commentsCount: 88,
    tipsTotal: 120,
    createdAt: "2026-11-01T11:00:00Z",
    tags: ["PCMasterRace", "Overclocking", "Hardware"],
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
        text: "Hey babe! 💕 Welcome to my exclusive VIP chat. If you're looking to subscribe ($60/mo) and unlock my full uncut 4K video vault, message me right here to get my approved CashApp, PayPal, Zelle, or Crypto details! 😈 Let me know what payment method works best for you!",
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
        text: "Hey Alex! Thank you so much for the tip! 💕 You can send your $60 directly to my CashApp: $NicoleShaylaVIP or PayPal: paypal.me/nicoleshaylavip. Reply here once sent so I can verify and activate your full vault access! 💋",
        timestamp: "2026-11-15T10:30:00Z",
        tip: 0
      }
    ]
  }
];

