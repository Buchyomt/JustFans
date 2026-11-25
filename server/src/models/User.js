import bcrypt from 'bcryptjs';
import { mockUsers } from '../data/mockData.js';

// Default demo password hash for 'password123' (10 salt rounds)
const DEFAULT_DEMO_HASH = "$2a$10$w09ZkF.9oG07q9OtiR6x4u799Pkyx1hA39D93k2v78VvVp004fA7S";

// Ensure seed users have passwordHash and createdAt
mockUsers.forEach(u => {
  if (!u.passwordHash) {
    u.passwordHash = DEFAULT_DEMO_HASH;
  }
  if (!u.createdAt) {
    u.createdAt = "2026-11-01T00:00:00.000Z";
  }
});

class UserModel {
  constructor() {
    this.users = mockUsers;
  }

  // Find user by unique ID
  findById(id) {
    return this.users.find(u => u.id === id) || null;
  }

  // Find user by Email (case-insensitive)
  findByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // Find user by Username (case-insensitive)
  findByUsername(username) {
    if (!username) return null;
    return this.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  // Find by either email or username
  findByCredential(credential) {
    if (!credential) return null;
    const cred = credential.toLowerCase().trim();
    return this.users.find(u => 
      (u.email && u.email.toLowerCase() === cred) || 
      (u.username && u.username.toLowerCase() === cred)
    ) || null;
  }

  // Duplicate validation check
  checkDuplicate({ username, email }) {
    if (username && this.findByUsername(username)) {
      return { duplicate: true, field: 'username', message: 'Username is already taken.' };
    }
    if (email && this.findByEmail(email)) {
      return { duplicate: true, field: 'email', message: 'An account with this email already exists.' };
    }
    return { duplicate: false };
  }

  // Create a new user with passwordHash and createdAt
  async create({ username, email, password, role = 'fan', name, bio, avatar, category, monthlyPrice }) {
    // Generate bcrypt hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const resolvedPrice = Number(monthlyPrice) > 0 ? Number(monthlyPrice) : 60.00;

    const newUser = {
      id: `user-${Date.now()}`,
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
      name: name || username,
      role: role || 'fan',
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`,
      bio: bio || (role === 'creator' ? 'VIP Creator on JustFans' : 'Supporter & fan.'),
      walletBalance: 50.00,
      following: [],
      subscriptions: [],
      bookmarks: [],
      ...(role === 'creator' ? {
        category: category || 'Solo VIP',
        subscriberCount: 0,
        postCount: 0,
        likeCount: 0,
        monthlyPrice: resolvedPrice,
        vipPrice: Math.round(resolvedPrice * 1.65),
        verified: false,
        tiers: [
          {
            id: `tier-${Date.now()}`,
            name: "Standard Fan",
            price: resolvedPrice,
            perks: ["Full access to 4K uncensored video vault & feed", "Daily video drops & private feed", "Comment & direct messaging"]
          }
        ]
      } : {})
    };

    this.users.push(newUser);
    return newUser;
  }

  // Update existing user profile fields
  update(id, updates = {}) {
    const user = this.findById(id);
    if (!user) return null;

    const allowed = ['name', 'username', 'bio', 'avatar', 'banner', 'walletBalance'];
    for (const key of allowed) {
      if (updates[key] !== undefined && updates[key] !== null) {
        user[key] = updates[key];
      }
    }
    return user;
  }

  // Verify password against stored hash
  async comparePassword(password, passwordHash) {
    if (!password || !passwordHash) return false;
    // For demo convenience if using unhashed fallback
    if (password === 'password123' && passwordHash === DEFAULT_DEMO_HASH) {
      return true;
    }
    return bcrypt.compare(password, passwordHash);
  }

  // Return safe user object omitting passwordHash
  toSafeUser(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export const User = new UserModel();

