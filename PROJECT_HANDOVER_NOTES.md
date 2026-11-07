# JustFans — Full-Stack Platform Handover Notes & Architecture

> **Application**: JustFans — Creator Subscription, Video Streaming & Monetization Platform  
> **Status**: Full-Stack Architecture Implemented & Ready for Local / Cloud Deployment  
> **Backend**: Node.js & Express (ESM) with REST API (:5000)  
> **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React (:5173)  

---

## 🚀 How to Run the Platform

You can run both the server and client simultaneously or in two separate terminals.

### Method 1: Root Convenience Scripts
From the `JustFans` root directory:
```bash
# Terminal 1: Run Backend API Server
npm run dev:server
```
*(Server listens on `http://localhost:5000`)*

```bash
# Terminal 2: Run Frontend Client
npm run dev:client
```
*(Frontend runs on `http://localhost:5173` with automatic API proxying to port 5000)*

---

## 🌟 Implemented Features & Modules

### 1. Home Feed (`/`)
- Dynamic video and photo stream from creators.
- **Paywall / Teaser Mode**: Subscriber-exclusive and Pay-Per-View (PPV) content renders with frosted glass blur, lock badge, and one-click unlock / subscribe modals.
- **Content Filter Tabs**: All Content, Subscribed Only, HD Videos, Photos & Art.
- **Interactive Engagements**:
  - Like counter with instant update.
  - Interactive Tip Modal (\$5, \$10, \$25, \$50 or custom \$ with personal message).
  - Comment drawer with real-time thread updates.
  - Bookmark post to favorites.
- **Top Stories Rail**: Creator avatar carousel for fast navigation.

### 2. Discover & Explore Creators (`/explore`)
- Multi-category filtering: *Fitness & Wellness*, *Music & Production*, *Digital Art & 3D*, *Tech & Gaming*.
- Real-time search query matching creator names, usernames, and bios.
- Creator profile cards displaying active subscriber counts, total posts, like aggregates, and monthly membership rates.

### 3. Creator Channel / Profile (`/creator/:username`)
- Full-width hero cover banner and avatar with verified creator checkmark.
- Follow / Unfollow toggle.
- Channel counters: Subscribers, Posts, Likes, Monthly Price.
- Tiered Membership Cards (Standard Fan vs VIP All-Access) with included perk checklist.
- Filterable post tabs: All Posts, Videos, Photos, and Locked Exclusives.

### 4. Creator Studio Dashboard (`/studio`)
- Accessible to creators (or fans testing via the Demo Switcher).
- **Key Performance Indicators (KPIs)**:
  - Gross Revenue (\$ earned)
  - Monthly Recurring Revenue (MRR)
  - Active Subscriber count & growth percentage
  - Tips & Pay-Per-View earnings breakdown
- **Content Composer**:
  - Title, description, media format (video/photo), URL.
  - Monetization switch: Free vs Subscriber-only with custom PPV price.
- **Monthly Trajectory**: Visual 6-month earnings bar chart.

### 5. Direct Messaging & PPV DMs (`/messages`)
- Direct chat threads between fans and creators.
- Tip-to-Chat functionality (attach \$ tip with your message).
- Locked multimedia messages with inline **"Unlock Media for \$X.XX"** purchase button.

### 6. Subscriptions Manager (`/subscriptions`)
- List of active fan memberships, renewal dates, and billing amounts.
- Cancel or manage memberships with one click.

### 7. Instant Demo Persona Switcher & Test Wallet
- **Identity Switcher** (in top navbar): Switch between **Alex Johnson (Fan / VIP Subscriber)**, **Aria Nova (Fitness Coach)**, **Marcus Cole (Music Producer)**, **Elena Rostova (Concept Artist)**, and **Kai Vance (Tech & Gaming)**.
- **Test Wallet Top-Up**: Click wallet balance pill in the navbar to add \$25, \$50, or \$100 test credit to test purchases, tips, and unlocks.

