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

### 7. Complete User Authentication System (Bcrypt & JWT)
- **User Model** ([`server/src/models/User.js`](file:///c:/Users/user/OneDrive/Desktop/JustFans/server/src/models/User.js)):
  - Fields: `id`, `username`, `email`, `passwordHash`, `createdAt`, `role`, `walletBalance`.
  - Password hashing with **bcrypt** (salt rounds = 10).
  - Duplicate username and email validation with clean HTTP 409 responses.
- **REST Endpoints** ([`server/src/routes/auth.js`](file:///c:/Users/user/OneDrive/Desktop/JustFans/server/src/routes/auth.js)):
  - `POST /api/auth/signup`: Password hashing + duplicate validation + returns signed JWT token.
  - `POST /api/auth/login`: Credential validation + password verification + returns signed JWT token.
  - `GET /api/auth/me`: Protected route returning active user context.
- **Auth Middleware** ([`server/src/middleware/auth.js`](file:///c:/Users/user/OneDrive/Desktop/JustFans/server/src/middleware/auth.js)):
  - `requireAuth`: Guards designated protected API endpoints (`POST /api/posts`, studio analytics, messages, subscriptions).
  - `optionalAuth`: Allows anonymous feed browsing while attaching `req.user` if logged in.
- **Frontend Authentication UI (Vanilla CSS)**:
  - Form stylesheet ([`client/src/styles/auth.css`](file:///c:/Users/user/OneDrive/Desktop/JustFans/client/src/styles/auth.css)): Built strictly using vanilla CSS for clean, responsive, dark-mode form presentation.
  - Auth Page ([`client/src/pages/AuthPage.jsx`](file:///c:/Users/user/OneDrive/Desktop/JustFans/client/src/pages/AuthPage.jsx)): Sign In and Sign Up tabs, validation messages, and quick one-click demo login buttons.
  - Route Protection ([`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/user/OneDrive/Desktop/JustFans/client/src/components/ProtectedRoute.jsx)): Restricts upload features (`/studio`), redirecting unauthenticated users to `/login`.
  - Token Management: Auth token stored safely in `localStorage` and sent as `Bearer` header on all protected requests.

