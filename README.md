# 🌿 AURA Gastronomy
### The Resilient, Real-Time Operating System for Modern Dining & Hospitality

<div align="center">

[![Dining Experience](https://img.shields.io/badge/Dining-Zero--Friction%20QR-166534?style=for-the-badge&logoColor=fff)](#-shift-stories-how-aura-handles-real-service)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Client--Trust-0f172a?style=for-the-badge&logoColor=38bdf8)](#-zero-client-trust-security--architecture)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20•%20Vite%205%20•%20TS-2563eb?style=for-the-badge&logo=typescript&logoColor=white)](#-tech-stack)
[![Backend](https://img.shields.io/badge/Backend-Node%20•%20Express%20•%20MongoDB-059669?style=for-the-badge&logo=nodedotjs&logoColor=white)](#-tech-stack)
[![Build Status](https://img.shields.io/badge/Build-Passing%20(0%20Errors)-emerald?style=for-the-badge&logo=vite&logoColor=white)](#-running-locally)

<br />

> **“Most restaurant tech feels like it was designed in 1998 and bolted onto a tablet.”**
>
> Clunky $4,000 legacy terminals that crash when three servers hit 'Print'. Lost paper chits soaking in sauce at the pass. Awkward diner wave-downs across a crowded room. And hideous 100MB mobile apps that force customers to register an account just to order an appetizer.
>
> **AURA was built to throw that entire mess away.**

<p align="center">
  <b>Conceived, Architected & Handcrafted with heart by <a href="https://github.com/Niranjan-Kumar-Singh">Niranjan Kumar Singh</a></b><br />
  <a href="mailto:niranjansingh1419@gmail.com"><code>niranjansingh1419@gmail.com</code></a> &nbsp;•&nbsp;
  <a href="https://instagram.com/niranjan.ks.in"><code>@niranjan.ks.in</code></a> &nbsp;•&nbsp;
  <a href="https://github.com/Niranjan-Kumar-Singh/AURA-GASTRONOMY-RESTAURANT">GitHub Repository</a>
</p>

</div>

---

## 📖 The Backstory: Why I Built This

I’ve spent hours observing busy dinner services—watching what happens when an 8:30 PM rush hits the dining floor at full speed.

Here is what *actually* happens in real dining rooms:
1. **The Kitchen Runs Out of Scallops Mid-Service:** The line cook yells across the kitchen pass that scallops are *86’d*. The floor staff doesn't hear it over the dining room chatter. A server rings in two more orders five minutes later. The manager now has to go to the table, apologize, void the tickets, and re-balance the entire check.
2. **The App Trap:** Guests sit down, scan a QR code, and get hit with: *"Download our app from the App Store and create a password."* Nobody does it. They put their phone away, wait 10 minutes to catch a server's eye, and the whole service slows down.
3. **The Refund Disaster:** A guest sends back one glass of wine because it wasn't chilled. Most POS systems force the cashier to void the whole £280 bill, re-punch 12 dishes from scratch, and leave the end-of-night accounting ledger off by £15.
4. **Basement Signal Dead Zones:** Guests sit in a subterranean cellar or secluded courtyard with zero cellular reception, staring at a blank loading screen because they don't know the guest Wi-Fi password.

**AURA was engineered to be the quiet, dependable pulse that solves every single one of these problems without getting in the way of hospitality.**

Hospitality isn't about staring at screens; it's about warmth, timing, and great food. The software should simply be invisible, ultra-fast, and indestructible under load.

---

## 🧭 System Topology

Here is how data, state, and audio move through the venue:

```
                            ┌──────────────────────────────────────────────┐
                            │           🌿 AURA GASTRONOMY OS              │
                            │        Real-Time Multi-Station Pulse         │
                            └──────────────────────┬───────────────────────┘
                                                   │
          ┌────────────────────────────────────────┼────────────────────────────────────────┐
          │                                        │                                        │
          ▼                                        ▼                                        ▼
┌──────────────────────┐                ┌──────────────────────┐                ┌──────────────────────┐
│  📱 GUEST TABLE PORTAL│                │  🍳 KITCHEN PASS KDS │                │  🤵 FLOOR COMMAND    │
├──────────────────────┤                ├──────────────────────┤                ├──────────────────────┤
│ • Clean /menu URL    │                │ • High-Contrast Grid │                │ • 30-Table Visual Grid│
│ • No Password or App │                │ • Instant Dish 86    │                │ • Web Audio Melodic  │
│ • Floating Service   │                │ • Auto Bill Re-calc  │                │   Service Chimes     │
│ • Live Prep Milestones│               │ • Priority Timers    │                │ • One-Tap Table Reset│
└──────────┬───────────┘                └──────────┬───────────┘                └──────────┬───────────┘
           │                                       │                                       │
           └───────────────────────────────────────┼───────────────────────────────────────┘
                                                   │
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │          💳 POS, CASHIER & AUDIT             │
                            ├──────────────────────────────────────────────┤
                            │ • Item-Level Partial & Full Refunds          │
                            │ • Retained Net Revenue Ledgering             │
                            │ • 80mm Thermal Slip + A4 GST Tax Invoices    │
                            │ • Bespoke Dual-QR Acrylic Stand Generator    │
                            └──────────────────────┬───────────────────────┘
                                                   │
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │        🛡️ ZERO-TRUST NODE.JS CORE            │
                            ├──────────────────────────────────────────────┤
                            │ • Server-Side Authoritative Pricing Recalc   │
                            │ • Deep Recursive NoSQL Injection Scrubbing   │
                            │ • Station-Based Role Access (PIN Protected)  │
                            │ • Compound MongoDB Performance Indexes       │
                            └──────────────────────────────────────────────┘
```

---

## ⚡ Shift Stories: How AURA Handles Real Service

### 🍝 Scenario 1: The Kitchen Runs Out of Scallops at 8:42 PM
* **The Problem:** The line cook uses the last portion of Pan-Seared Scallops. Three tables are currently looking at the menu.
* **The AURA Fix:** The chef taps **86 Dish** on the KDS terminal.
  - The Scallops instantly disappear from all live customer menus.
  - Any pending order containing the scallops can be partially cancelled right from the pass with a selected reason (*"Ingredient Depleted"*).
  - The order’s subtotal, service charges, and taxes re-calculate automatically on the fly.
  - The guest's phone tracker shows a courteous status badge: *"Dish Cancelled by Kitchen (Out of Stock)"* and updates their bill in real time. No confusion, no awkward surprise at checkout.

### 🍷 Scenario 2: A Spilled Drink & Partial Refund
* **The Problem:** A guest accidentally knocks over a glass of vintage Pinot Noir (£18) and the floor manager wants to comp it without disrupting the rest of their £320 anniversary dinner check.
* **The AURA Fix:** The cashier opens the table's check, taps **Refund Line Item**, selects the Pinot Noir, and logs the reason (*"Spilled / Manager Courtesy"*).
  - The system adjusts the balance: `netAmount = originalTotal - refundAmount`.
  - The thermal receipt prints an itemized credit deduction line.
  - The daily executive revenue dashboard deducts the £18 from net sales so the night's cash-out ledger balances to the penny.

### 📶 Scenario 3: Cell Signal Drop in the Wine Cellar
* **The Problem:** Table 12 is seated in the corner alcove where mobile reception drops to one bar.
* **The AURA Fix:** The acrylic stand on Table 12 features a **Dual-QR Stand**:
  - **Left QR:** Direct scan to connect to the venue's private 5GHz Guest Wi-Fi (built using the standard WPA Wi-Fi protocol—one tap and they are online).
  - **Right QR:** Clean scan directly into Table 12's personalized digital dining menu.

### 🛡️ Scenario 4: The Mischievous Guest
* **The Problem:** A tech-savvy patron opens Chrome DevTools and changes the price of Wagyu A5 Striploin from £95 to £0.95 in the checkout JSON payload before submitting.
* **The AURA Fix:** The backend operates on **Zero Client Trust**. The server strips all prices sent from the browser, queries the official database prices for each menu item ID, computes taxes and service charge on the server, and stores the authentic total. The tampering attempt fails silently and harmlessly.

---

## ✨ Features Crafted for Each Station

### 1. 📱 For the Dining Guest (Diner Portal)
* **Zero Registration Wall:** Guests simply enter a 10-digit mobile number during ordering to link their loyalty points and order history. No passwords, no confirmation emails, no barrier to eating.
* **Automatic +100 Loyalty Bonus:** New dining numbers are automatically gifted 100 points on their first order.
* **Clean URLs:** Tables are securely authenticated without exposing ugly, brittle session tokens in the browser's address bar.
* **Floating Floor Chimes:** One tap on **"Water Refill"** or **"Call Server"** sends an ambient notification directly to the waiter station.
* **AI Sommelier (Groq Cloud Llama-3.3-70B):** An intelligent, conversational wine and flavor-pairing assistant that suggests dishes tailored to the guest's palate.

### 2. 🍳 For the Kitchen (KDS Pass)
* **High-Visibility Cooking Grid:** High-contrast dark interface engineered for hot, steamy kitchen environments with clear visual hierarchy.
* **Prep Milestones:** Distinct status steps: `Received` ➔ `Preparing` ➔ `Ready` ➔ `Served`.
* **Line-Item Dish 86:** Cancel specific unavailable items on an active ticket without voiding the table's whole dinner.
* **Live Ticket Timers:** Color-coded elapsed time badges show line cooks which orders need immediate plating.

### 3. 🤵 For Floor Staff (Waiter Terminal)
* **30-Table Visual Floor Grid:** Color-coded status at a glance:
  - 🟢 **Vacant** (Ready for seating)
  - 🔵 **Occupied** (Actively dining)
  - 🟡 **Billing** (Check requested / settling)
  - 🟣 **Needs Bussing** (Table ready for turnover)
* **Synthesized Web Audio Chimes:** Built-in musical chime engine using the browser's native **Web Audio API** (harmonic dual-tone chords at 587Hz & 880Hz with natural decay). No external sound files, no network delays, zero audio clipping.
* **1-Tap Table Reset:** Clean and re-open tables instantly with one tap to keep floor turnover high.

### 4. 💳 For Cashiers & Accountants (POS & Ledger)
* **Precision Refunds:** Supports **Full Refunds**, **Partial Value Offsets**, and **Item-Level Line Returns** with full audit logs (who issued it, at what time, and why).
* **True Net Revenue Tracking:** Calculates `netAmount = total - refundAmount`, guaranteeing that daily closing summaries, tax reports, and owner analytics match real banked revenue.
* **Dual Printing Engine:**
  - **80mm Thermal Receipt:** Clean slip with item breakdowns, discount lines, refund deductions, and cashier name.
  - **Formal A4 GST Invoice:** Full business tax breakdown with GSTIN, CGST, SGST, customer information, and tax summary tables.

### 5. 🖨️ Luxury Dual-QR Table Stand Generator
* **Print-Ready Acrylic Stands:** Generates bespoke, high-resolution table cards designed for standard acrylic table tents (A4, A5, and A6).
* **Dual QR Integration:** Combines both the **Table Order QR** and the **WPA Guest Wi-Fi Auto-Connect QR** side-by-side on the same luxury card.
* **Live Domain Config:** Change your dining URL (e.g. from local test server to your custom restaurant domain) directly inside the Settings UI without touching a line of code.
* **300 DPI Export:** Export crisp PNGs ready for commercial printing, or print directly using the built-in `@media print` CSS layout.

---

## 🛠️ Tech Stack & Decisions

| Layer | Technologies | Why It Was Chosen |
|:---|:---|:---|
| **Frontend** | React 19, TypeScript (Strict), Vite 5 | Instant HMR during development, strict type safety across order payloads, and tiny production bundle sizes. |
| **State & UI** | Zustand, Framer Motion, TailwindCSS | Predictable, lightweight state store without Redux boilerplate; buttery-smooth hardware-accelerated animations. |
| **Audio** | Native Web Audio API | Zero network requests for audio assets; synthesized sine-wave harmonies that play reliably even on offline kiosks. |
| **Backend** | Node.js, Express 5 | High concurrency for multi-terminal polling and order dispatch with minimal memory overhead. |
| **Database** | MongoDB Atlas, Mongoose | Flexible document model for dynamic dishes, multi-state orders, and embedded refund audit records. |
| **AI Layer** | Groq Cloud (Llama 3.3 70B) | Ultra-low latency responses (<400ms) for the interactive sommelier and dining recommendation assistant. |

---

## 🛡️ Zero-Client-Trust Security & Architecture

We treat every client connection—whether from a diner's smartphone or an unknown tablet—as untrusted:

1. **Authoritative Server Pricing & Coupon Verification:** The frontend never decides what an order costs or what discount is applied. When an order payload arrives, the server ignores any provided prices, looks up current item costs in MongoDB, verifies coupons and minimum order thresholds directly from the `Coupon` collection, and recalculates line items, 5% GST taxes, and totals authoritatively.
2. **Discount Stacking Protection:** Table orders sent in multiple batches (appetizers, then mains, then desserts) never duplicate or stack coupon discounts repeatedly.
3. **Strict Origin-Allowlist CORS:** Restricts incoming requests to designated production and development origins with credentials protection, preventing arbitrary cross-origin token exploitation.
4. **Hardened JWT Secret & Fail-Safe Startup:** All token issuance and verification enforce cryptographically strong 64-character secrets. Missing `JWT_SECRET` immediately halts startup with an explicit security alert.
5. **PII and Financial Endpoint Protection:** Endpoints exposing dining history, wallet balances, and refund issuance (`/orders/phone/:phone`, `/loyalty/transactions/:phone`, `/orders/:orderId/refund`, `/api/loyalty/admin/adjust`) require authenticated sessions and role checks (`ADMIN`, `MANAGER`, `CASHIER`, `OWNER`).
6. **Anti-Farming Feedback Verification:** `POST /api/loyalty/feedback-reward` requires a valid, completed, and settled order that strictly belongs to the claimant's phone number before granting loyalty points.
7. **Recursive NoSQL Scrubbing:** Custom middleware inspects all request bodies, query strings, and route parameters, stripping out dangerous MongoDB query operators (`$gt`, `$regex`, `$where`, etc.) to block injection attacks.
8. **Optimized Compound Indexes:** Compound indexes on `(tableId, paymentStatus)`, `(status, paymentStatus)`, `(paymentStatus, paidAt)`, and `createdAt` ensure live sync queries return in under 3 milliseconds under heavy floor load.

---

## ⚡ Operational Stability & Financial Sync

1. **Cashier POS Manual Discounts:** Cashiers can apply custom percentage or flat monetary discounts on the POS terminal. `/api/orders/pay-table` distributes discounts proportionally across active table tickets, recalculates 5% GST, and archives bills at the exact negotiated settlement price.
2. **Country-Code Agnostic Phone Normalization:** A unified query engine (`phoneUtils.js`) matches customer accounts whether entered as standard 10-digit mobile numbers or prefixed with international codes (`+91`), ensuring loyalty point accruals and wallet redemptions never fail.
3. **Resilient Station Auth & 401 Interceptors:** The Axios network interceptor distinguishes between token expiry on authenticated staff dashboards and unauthenticated public checks, preventing staff terminals from abruptly logging out during network fluctuations.
4. **Unified Dining Zone Taxonomy:** Dining areas are synchronized across customer QR menus, waiter terminals, and cashier POS feeds:
   - **Main Hall:** Tables 1–12
   - **VIP Lounge:** Tables 13–16
   - **Outdoor Garden:** Tables 17–24
   - **Family Section:** Tables 25–30
5. **Full Admin Coupon Management:** Dedicated administration interface in `AdminDashboardPage` allowing managers to create promotional campaigns, adjust discount amounts, configure minimum order thresholds, and toggle active/inactive campaign status in real time.

---

## 🚀 Live Station Reference & Default Credentials

| Station | Route | Default Access | Key Capabilities |
|:---|:---|:---|:---|
| 📱 **Guest Dining Menu** | `/menu` | *Open to all guests* | Dynamic menu, dietary filters, chef notes, cart & checkout |
| ⏱️ **Live Order Tracker** | `/order/:orderId` | *Automatic on checkout* | Real-time prep stage tracker & live bill adjustment notices |
| 🍳 **Kitchen Pass (KDS)** | `/kitchen` | `chef@aura.com` / `Chef@Aura2026!` | High-contrast tickets, dish 86 controls, ticket timer badges |
| 🤵 **Floor Command** | `/waiter` | `waiter@aura.com` / `Waiter@Aura2026!` | 30-table layout, audio chimes, service calls, table turnover |
| 💳 **Cashier Station** | `/cashier` | `cashier@aura.com` / `Cashier@Aura2026!` | Settlement, item refunds, thermal & GST invoice printing |
| 👑 **Executive Dashboard** | `/owner` | `owner@aura.com` / `Owner@Aura2026!` | True net sales, hourly rush heatmaps, dish velocity stats |
| ⚙️ **Platform Settings** | `/admin/settings` | `admin@aura.com` / `Admin@Aura2026!` | Venue branding, dining host URL, guest Wi-Fi credentials |
| 🏷️ **Coupon Management** | `/admin` (Coupons Tab) | `admin@aura.com` / `Admin@Aura2026!` | Promo codes, minimum spend thresholds, live activation |
| 🔐 **Fast Staff Gate** | `/login` | Passcode: `AURA2026` | Quick 1-click station switcher for dedicated floor tablets |

---

## 🔄 Automated CI/CD Pipeline

The project includes an enterprise-grade GitHub Actions CI/CD pipeline ([`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)) with parallel jobs:

* **`frontend-build`:**
  - Environment: Node.js 20 on `ubuntu-latest`
  - Automated dependency caching via `frontend/package-lock.json`
  - Strict TypeScript validation (`tsc -b`) and Vite production bundle optimization
* **`backend-build`:**
  - Environment: Node.js 20 on `ubuntu-latest`
  - Automated dependency caching via `backend/package-lock.json`
  - Clean automated dependency installation via `npm ci`
  - Full recursive syntax and code quality verification across all routes, models, middleware, and core server files

---

## 💻 Quick Start: Running Locally

### 1. Clone & Enter the Project
```bash
git clone https://github.com/Niranjan-Kumar-Singh/AURA-GASTRONOMY-RESTAURANT.git
cd AURA-GASTRONOMY-RESTAURANT
```

### 2. Configure & Start Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/aura_restaurant?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_random_64_char_secret_key_here
DEV_SECRET=aura_dev_ops_secret_2026
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=development
```

Seed initial culinary catalog and staff accounts:
```bash
node seed.js
```

Start the API server:
```bash
npm start
# ➜ Server running on port 5000
# ➜ MongoDB Connected successfully
```

Run backend quality and syntax verification:
```bash
npm test
# ➜ node --check server.js
```

### 3. Start Frontend Dev Server
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
# ➜ Local: http://localhost:5173/
```

### 4. Build for Production
To verify strict TypeScript compilation and build production assets:
```bash
cd frontend
npm run build
# ➜ tsc -b && vite build
# ➜ Built cleanly in ~5s with 0 errors
```

---

## 🧪 Built-In Automated Verification

AURA includes dedicated verification scripts for financial calculations and enterprise security:

```bash
# 1. Verify Line-Item Dish 86 & Financial Auto-Recalculation
node backend/tools/test_cancellation.js
# ➜ Tests partial cancellations, automatic subtotal re-weighting, and total-void resets

# 2. Verify Security Defenses & Anti-Tampering Engine
node backend/tools/test_security.js
# ➜ Tests server-side price enforcement, ReDoS prevention, and MongoDB compound indexes
```

---

## 🎨 The Aesthetic Philosophy: RASA

The culinary soul of AURA is built around **RASA** (रस) — the ancient Sanskrit aesthetic philosophy of discovering the pure, unadulterated essence of an experience.

We translated that directly into the user interface:
* **Deep Obsidian & Slate:** Low-light dining room friendly; doesn't blind guests enjoying an intimate candlelit dinner.
* **Warm Champagne & Emerald Accents:** Elegant visual cues that direct attention to what matters: dishes, preparation states, and hospitality alerts.
* **Micro-Haptics & Tactile Feedback:** Buttons and drawers slide with physical weight and calibrated spring physics, making tablets feel like premium hospitality hardware.

---

## 👨‍💻 Handcrafted By

<div align="center">

### **Niranjan Kumar Singh**
*Full-Stack Software Engineer & Architecture Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-Niranjan--Kumar--Singh-181717?style=flat-square&logo=github)](https://github.com/Niranjan-Kumar-Singh)
[![Instagram](https://img.shields.io/badge/Instagram-@niranjan.ks.in-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://instagram.com/niranjan.ks.in)
[![Email](https://img.shields.io/badge/Email-niranjansingh1419@gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:niranjansingh1419@gmail.com)
[![Project](https://img.shields.io/badge/Repo-AURA--GASTRONOMY-blue?style=flat-square&logo=git)](https://github.com/Niranjan-Kumar-Singh/AURA-GASTRONOMY-RESTAURANT)

<br />

<sub>*"Technology in a restaurant should be like a world-class maître d' — always present when you need it, completely invisible when you don't."*</sub>

</div>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). You are free to adapt, extend, and deploy it for independent restaurants, boutique cafes, or luxury hospitality venues.
