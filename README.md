# 🌿 AURA Gastronomy — The Next-Gen Luxury Restaurant Operating System

<div align="center">

  <img src="https://img.shields.io/badge/Concept-RASA%20Modern%20Gastronomy-0C831F?style=for-the-badge&logoColor=fff" alt="RASA" />
  <img src="https://img.shields.io/badge/Architecture-AURA%20OS%20v2.6-0F0F11?style=for-the-badge&logoColor=fff" alt="AURA OS" />
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="MIT License" />
  <br />
  <img src="https://img.shields.io/badge/TypeScript-Strict%20Mode-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_19-Vite_Bundled-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js_Express-Hardened-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-Indexed-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Status-Live%20%26%20Battle--Tested-10B981?style=for-the-badge" alt="Production Grade" />

  <br /><br />

  <p align="center">
    <b>A cohesive, real-time operating system that connects diners, line cooks, floor captains, and restaurant owners into one seamless rhythm.</b><br />
    Cryptographic Table QR Stands · Clean <code>/menu</code> URLs · Frictionless Mobile-Only Diner Onboarding · Live Chef KDS with Item 86 · Waiter Floor Dispatch & Web Audio Bells · Cashier POS with Partial & Item-Level Refunds · Gamified Retention Engine · Zero Client Trust Security
  </p>

  <p align="center">
    👤 <b>Designed & Built by:</b> <a href="https://github.com/Niranjan-Kumar-Singh"><b>Niranjan Kumar Singh</b></a><br />
    📬 <b>Get in Touch:</b> <a href="mailto:niranjansingh1419@gmail.com"><code>niranjansingh1419@gmail.com</code></a> &nbsp;|&nbsp; 📸 <b>Instagram:</b> <a href="https://instagram.com/niranjan.ks.in"><code>@niranjan.ks.in</code></a>
  </p>

</div>

---

## 📖 Why I Built AURA (The Origin Story)

Anyone who has worked a chaotic Friday evening in a restaurant knows the harsh reality behind the dining room curtains:
- Paper tickets get smeared with butter or lost in the pass steam.
- Diners awkwardly wave their arms across crowded dining rooms trying to catch a server's eye just to get their water glass refilled or request the bill.
- When an ingredient runs out mid-shift, old-school POS systems force cashiers to void entire six-person banquet checks just to remove a single sold-out dessert.
- Guest loyalty programs end up abandoned because nobody wants to download yet another 80MB app or remember a password while they're out having dinner with family or friends.
- And at the end of the night, restaurant owners are left staring at disjointed printouts wondering what their real retained margins actually are after comps and refunds.

I built **AURA Gastronomy** to fix these exact real-world headaches.

This isn't another generic mock restaurant template or a simple static menu. It is an end-to-end, full-stack operational nervous system crafted for high-volume hospitality. Every detail—from the 6-second mobile onboarding flow to the line chef's 86-item recalculation engine—was designed with one clear philosophy: **make it completely frictionless for the customer, lightning-fast for the staff, and profitable for the owner.**

> 🌿 *The culinary showcase powering this demo is* **RASA** *— inspired by the classical Sanskrit concept of aesthetic essence and evocative flavor. The UI reflects that spirit: quiet luxury, glassmorphism surfaces, dark mode elegance, and zero visual clutter.*

---

## 🌟 What Makes AURA Special?

### 1. 📲 Frictionless Diner Experience (Zero App, Zero Passwords)
* **Instant Mobile Onboarding:** Guests never fill out tedious registration forms or memorize passwords. Simply input a 10-digit mobile number at checkout (or via the sidebar) to instantly link the order, track live kitchen prep, and earn **+100 Welcome Loyalty Points**.
* **Clean URL Routing:** Guests scan an encrypted table stand (`/dine/:qrToken`) and are instantly routed to a pure, table-agnostic URL: `http://localhost:5173/menu`. No ugly table IDs cluttering their browser bar; no risk of URL manipulation between tables.
* **1-Tap Service Shortcuts:** Floating dedicated buttons for instant Water Refills and Waiter Call assistance directly alert floor staff with audible chimes.
* **Smart Cart & Real-Time Tracking:** Diners watch their meal progress through four live stages: `Received` ➔ `Preparing` ➔ `Ready` ➔ `Served`.

### 2. 🍳 Chef KDS with Dynamic Dish 86'ing & Auto-Recalculation
* **Per-Dish Cancellation:** If the pantry runs out of fresh truffles or saffron mid-shift, line chefs can cancel individual dishes without voiding the entire table ticket.
* **Real-Time Financial Recalculation:** Subtotal, GST, service charge, and discounts automatically adjust on the fly.
* **Live Diner Notification:** The customer's order tracker instantly flags the dish with an informative `Cancelled by Kitchen: [Reason]` badge and displays the updated bill balance in real time.
* **Cascade Void Safeguard:** If all items in a ticket are cancelled, the entire ticket cleanly transitions to voided status, releasing the table session and reversing any redeemed loyalty points.

### 3. 🤵 Waiter Floor Command & Audio Chime Dispatch
* **30-Table Real-Time Grid:** Visual color-coded table states (`Vacant`, `Occupied`, `Billing`, `Cleaning`).
* **Instant Audible Dispatch:** Native Web Audio API synthesizers play subtle, ambient chimes when a table calls for water or service.
* **Digital QR Stand Management:** Generate, preview, print, or rotate cryptographic QR stands right from the floor terminal.

### 4. 💳 Cashier POS with Item-Level Partial Refunds & Audit History
* **Precision Partial Refunds:** Cashiers can refund a single beverage or appetizer from an eight-item invoice without cancelling the order.
* **Custom Amount Offsets:** Issue exact rupee refunds for service recovery, complete with logged reasons and staff credentials.
* **True Net Revenue:** The system calculates and logs true retained net revenue (`total - refundAmount`), preventing accounting distortion in financial reports.
* **1-Click Multi-Tender Settlement:** Supports UPI QR, Card swipe, and Cash with instant thermal-style GST invoice generation.

### 5. 👑 Executive & Owner Intelligence
* **Authentic Retained Revenue:** Revenue dashboards accurately factor out partial and full refunds, displaying real cash flow.
* **Hourly Dining Rush Heatmaps:** Track peak revenue hours and identify high-performing dish categories.
* **Zero Ghost Orders:** Capturing diner mobile numbers at checkout builds a verified customer database, enabling repeat diner analytics and customer lifetime value tracking.

### 6. 🛡️ Enterprise Security & Price Anti-Tampering
* **Zero Client Trust:** All dish prices sent in checkout payloads are disregarded. The server fetches authoritative menu pricing from MongoDB and recalculates subtotals, taxes, and discounts server-side.
* **NoSQL Injection Defense:** Deep recursive sanitizers strip malicious MongoDB operators (`$where`, `$gt`, `$ne`, prototype pollution attempts).
* **Terminal Lockout Protection:** 1-Click Fast Login is restricted to authorized restaurant tablets via a master terminal passcode (`AURA2026`). Public devices see a clean, secure credentials prompt.

---

## 🗺️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               🌿 AURA GASTRONOMY OS                    │
                    └────────────────────────────────────────────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
┌──────────────────┐                  ┌──────────────────┐                  ┌──────────────────┐
│   DINER PORTAL   │                  │  OPERATIONS KDS  │                  │  MANAGEMENT POS  │
├──────────────────┤                  ├──────────────────┤                  ├──────────────────┤
│ • Pure /menu URL │                  │ • Line Cook Pass │                  │ • Cashier POS    │
│ • No-Password QR │                  │ • Dish 86 Engine │                  │ • Waiter Floor   │
│ • +100 PTS Gift  │                  │ • Auto Recalc    │                  │ • Partial Refund │
│ • 1-Tap Water    │                  │ • Kitchen Timers │                  │ • Owner Heatmaps │
└────────┬─────────┘                  └────────┬─────────┘                  └────────┬─────────┘
         │                                      │                                      │
         └──────────────────────────────────────┼──────────────────────────────────────┘
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │                NODE.JS + EXPRESS BACKEND               │
                    ├────────────────────────────────────────────────────────┤
                    │ • Price Anti-Tampering Validation Engine               │
                    │ • Recursive NoSQL Injection & ReDoS Sanitization       │
                    │ • Loyalty Ledger (Earn / Redeem / Refund Audit Logs)   │
                    │ • Multi-Route Auto Phone & Role Authentication         │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │             MONGODB ATLAS (INDEXED CLUSTER)            │
                    ├────────────────────────────────────────────────────────┤
                    │ • Tables (Opaque QR Tokens, Session Tracking)          │
                    │ • Orders (Item 86 Status, Dynamic Pricing, Net Sales)  │
                    │ • Users (Roles, Loyalty Wallets, Tier Progression)     │
                    │ • LoyaltyTransactions (Immutable Point Audit Trails)   │
                    └────────────────────────────────────────────────────────┘
```

---

## 📱 Operational Terminals & Portals

| Terminal / Station | Route | Key Capabilities |
|:---|:---|:---|
| 📱 **Customer Dining Menu** | `/menu` | Pure clean URL, Dietary filters (Veg, Non-Veg, Jain), dish notes, instant cart |
| ⏱️ **Live Order Tracker** | `/order/:orderId` | Real-time stage progression (`Received → Preparing → Ready → Served`), live bill |
| 🍳 **Kitchen Display (KDS)** | `/kitchen` | Order queue, elapsed timers, individual dish 86 cancellation modal, ticket void |
| 🤵 **Waiter Floor Console** | `/waiter` | 30-table interactive layout, live status tracking, audio chimes, QR stand manager |
| 💳 **Cashier POS Station** | `/cashier` | Table bill aggregation, GST invoice printing, UPI/Card/Cash settlement, partial refunds |
| 👑 **Owner Executive Suite** | `/owner` | Net retained revenue analytics, 24-hour service volume heatmap, popular dish rankings |
| 🔐 **Staff Access Portal** | `/login` | Terminal-authorized fast login with master passcode `AURA2026` + direct role presets |

---

## 🛠️ The Tech Stack

### Frontend Architecture
- **Core:** React 19, TypeScript (Strict Mode), Vite 5
- **State Orchestration:** Zustand (Cart, Session, Auth, Order, and Wishlist stores)
- **Styling:** Vanilla CSS Custom Properties + Tailwind CSS (Curated color tokens, glassmorphism, responsive breakpoints)
- **Animation & Transitions:** Framer Motion (Smooth modal drawers, dynamic collapse headers)
- **Sound Synthesizer:** Native Web Audio API (Zero external audio file dependencies)
- **Bundle Optimization:** Manual Rollup chunking (`vendor-core`, `vendor-libs`, `icons`, `index`) — **Built in 7.17s with 0 TypeScript errors**

### Backend Architecture
- **Runtime:** Node.js, Express 5 (Modular controller/route architecture)
- **Database:** MongoDB Atlas with Mongoose (Compound indexing on `tableId`, `status`, `phone`, `orderId`)
- **Security Suite:** Helmet HTTP protection, express-rate-limit, recursive NoSQL sanitizer, bcrypt password hashing, JWT authentication
- **AI Dining Sommelier:** Groq Cloud API integration (`llama-3.3-70b-versatile`)
- **Reliability:** Graceful SIGTERM/SIGINT shutdown handling, unhandled rejection catchers, automated database retry logic

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js** `v18+` or `v20+`
- **npm** `v9+`
- **MongoDB** (Local instance or free MongoDB Atlas URI)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Niranjan-Kumar-Singh/AURA-GASTRONOMY-RESTAURANT.git
cd AURA-GASTRONOMY-RESTAURANT
```

### Step 2: Configure & Start the Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key_optional
NODE_ENV=development
```

Start the API server:
```bash
npm start
# ➜ Server running on port 5000
# ➜ MongoDB Connected successfully
```

### Step 3: Launch the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
# ➜ Local: http://localhost:5173/
```

### Step 4: Explore the Demo Portals
- **Diner Experience:** Visit [http://localhost:5173/menu](http://localhost:5173/menu)
- **Staff Access:** Visit [http://localhost:5173/login](http://localhost:5173/login)
  - *Default Terminal Passcode:* `AURA2026`
  - *Head Chef:* `chef@aura.com` / `chef123`
  - *Floor Waiter:* `waiter@aura.com` / `waiter123`
  - *Cashier POS:* `cashier@aura.com` / `cashier123`
  - *Owner Suite:* `owner@aura.com` / `owner123`

---

## 🧪 Built-In Automated Verification Suites

AURA includes dedicated standalone verification scripts to validate core business rules, financial calculations, and security defenses:

```bash
# 1. Test Kitchen Dish 86 & Financial Auto-Recalculation
node backend/tools/test_cancellation.js
# ➜ 10/10 TESTS PASSED (Dish 86, subtotal recalculation, lockout guards, cascade void)

# 2. Test Enterprise Security & Anti-Tampering Defenses
node backend/tools/test_security.js
# ➜ 5/5 TESTS PASSED (Price anti-tampering, ReDoS mitigation, CastError safety, compound indexes)
```

---

## 🤝 Contributing

Contributions, feedback, and architectural discussions are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: add amazing capability'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 👨‍🍳 Behind the Code

**AURA Gastronomy** was architected and crafted with pride by **Niranjan Kumar Singh**.

* 🌐 **GitHub:** [@Niranjan-Kumar-Singh](https://github.com/Niranjan-Kumar-Singh)
* 📸 **Instagram:** [@niranjan.ks.in](https://instagram.com/niranjan.ks.in)
* 📧 **Email:** [niranjansingh1419@gmail.com](mailto:niranjansingh1419@gmail.com)
* 💼 **Repository:** [AURA-GASTRONOMY-RESTAURANT](https://github.com/Niranjan-Kumar-Singh/AURA-GASTRONOMY-RESTAURANT)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

<div align="center">
  <br />
  <sub>🌿 <em>Crafted with obsessive precision for the future of digital dining.</em></sub>
</div>
