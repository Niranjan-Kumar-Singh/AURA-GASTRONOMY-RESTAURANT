# 🌿 AURA Gastronomy
### Enterprise Digital Dining, Kitchen Display (KDS) & Multi-Station POS Operating System

<div align="center">

[![Build Status](https://img.shields.io/badge/CI%2FCD-Node%2022%20LTS%20Passing-059669?style=for-the-badge&logo=githubactions&logoColor=white)](.github/workflows/ci-cd.yml)
[![Vulnerabilities](https://img.shields.io/badge/Security-0%20Vulnerabilities%20(Audited)-10b981?style=for-the-badge&logo=dependabot&logoColor=white)](#-zero-client-trust-security-architecture)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20•%20Vite%205%20•%20TypeScript-2563eb?style=for-the-badge&logo=react&logoColor=white)](#-technical-specifications)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20•%20Express%205%20•%20MongoDB-059669?style=for-the-badge&logo=nodedotjs&logoColor=white)](#-technical-specifications)
[![PWA Ready](https://img.shields.io/badge/PWA-Standalone%20Mobile%20%26%20Tablet-f59e0b?style=for-the-badge&logo=pwa&logoColor=white)](#-mobile-ergonomics--pwa-installation)
[![License](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](LICENSE)

<br />

> **“Technology in a luxury restaurant should be like a world-class maître d' — always attentive when needed, completely seamless and invisible when dining.”**

AURA Gastronomy is a commercial-grade, full-stack digital dining platform and point-of-sale operating system designed for modern fine dining, boutique bistros, and luxury culinary venues. Engineered with **Zero-Client-Trust** financial security, instant table-side QR ordering, synchronized kitchen dispatch, and physical acrylic stand generation.

<p align="center">
  <b>Architected & Handcrafted by <a href="https://github.com/Niranjan-Kumar-Singh">Niranjan Kumar Singh</a></b><br />
  <a href="mailto:niranjansingh1419@gmail.com"><code>niranjansingh1419@gmail.com</code></a> &nbsp;•&nbsp;
  <a href="https://instagram.com/niranjan.ks.in"><code>@niranjan.ks.in</code></a> &nbsp;•&nbsp;
  <a href="https://github.com/Niranjan-Kumar-Singh/AURA-GASTRONOMY-RESTAURANT">GitHub Repository</a>
</p>

</div>

---

## 🗺️ System Topology & Dataflow

```
                            ┌──────────────────────────────────────────────┐
                            │           🌿 AURA GASTRONOMY OS              │
                            │      Unified Real-Time Hospitality Mesh      │
                            └──────────────────────┬───────────────────────┘
                                                   │
          ┌────────────────────────────────────────┼────────────────────────────────────────┐
          │                                        │                                        │
          ▼                                        ▼                                        ▼
┌──────────────────────┐                ┌──────────────────────┐                ┌──────────────────────┐
│  📱 GUEST TABLE PORTAL│                │  🍳 KITCHEN PASS KDS │                │  🤵 FLOOR COMMAND    │
├──────────────────────┤                ├──────────────────────┤                ├──────────────────────┤
│ • Zero-Download PWA  │                │ • High-Contrast Pass │                │ • 30-Table Visual Map│
│ • Masked /menu URL   │                │ • Line-Item Dish 86  │                │ • Web Audio Chimes   │
│ • Floating Service   │                │ • Elapsed Timers     │                │ • 1-Tap Table Reset  │
│ • Live Order Tracker │                │ • Auto-Rebalanced Tab│                │ • Active Waiter Calls│
└──────────┬───────────┘                └──────────┬───────────┘                └──────────┬───────────┘
           │                                       │                                       │
           └───────────────────────────────────────┼───────────────────────────────────────┘
                                                   │
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │          💳 POS, CASHIER & SETTLEMENT        │
                            ├──────────────────────────────────────────────┤
                            │ • Item-Level Line Returns & Partial Refunds  │
                            │ • Retained Net Revenue Accounting            │
                            │ • 80mm Thermal Slip + Formal A4 GST Invoices │
                            │ • Dual-QR Acrylic Table Stand Studio         │
                            └──────────────────────┬───────────────────────┘
                                                   │
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │        🛡️ ZERO-TRUST NODE.JS CORE            │
                            ├──────────────────────────────────────────────┤
                            │ • Authoritative Server-Side Pricing & GST    │
                            │ • Deep Recursive NoSQL Injection Scrubbing   │
                            │ • Compound MongoDB Performance Indexes       │
                            │ • Dual-Mode Serverless (Vercel) + Node.js    │
                            └──────────────────────────────────────────────┘
```

---

## ⚡ Station Modules & Core Capabilities

### 1. 📱 Contactless Diner Portal (`/menu`)
* **Zero Registration Wall:** Diners browse the full catalog without passwords or mandatory app downloads. A 10-digit mobile number links order tracking, loyalty coins, and digital bills.
* **Dual Seating Verification:** Supports physical cryptographic table QR code scans (`/dine/:token`) and direct web table selection (Tables 1–30 + Mayfair Suite).
* **Tactile Mobile Ergonomics:** Native web haptic vibration (`navigator.vibrate`) on touch interactions, quantity changes, and order confirmations.
* **Ambient Floating Service:** Instant one-tap requests for *Water Refill*, *Call Waiter*, *Extra Cutlery*, and *Request Bill*.
* **Smart Dietary Engine:** Combinable filtering for Vegetarian, Non-Vegetarian, Jain, Gluten-Free, Chef's Specials, and Bestsellers.

### 2. 🍳 Kitchen Display Terminal — KDS (`/kitchen`)
* **High-Contrast Culinary Pass:** Dark industrial theme engineered for visibility in steam, flame, and low kitchen lighting.
* **Prep Lifecycle Milestones:** Clear transition flow: `Received` ➔ `Preparing` ➔ `Ready` ➔ `Served`.
* **Line-Item Dish 86:** Instantly mark ingredients depleted. Automatically cancels individual line items without disrupting the rest of the table's active dining order.
* **Audio Alerts:** Web Audio API synthesized chime engine triggers automatically when new dining tickets land at the pass.

### 3. 🤵 Waiter Floor Command (`/waiter`)
* **30-Table Real-Time Floor Map:** Color-coded status overview across all four dining zones (Main Hall, VIP Lounge, Outdoor Terrace, Family Section):
  * 🟢 **Available** (Clean & ready for seating)
  * 🔵 **Occupied** (Actively dining with open orders)
  * 🟣 **Billing** (Check requested / awaiting cashier)
  * 🔘 **Cleaning** (Automatic countdown timer for floor turnover)
* **Active Service Dispatch Queue:** Dedicated tabs for **Ready Pass** (dishes plated and ready to run), **Waiter Calls**, and **Bill Requests**.

### 4. 💳 Cashier Billing POS Hub (`/cashier`)
* **Precision Audit Ledger:** Full support for **Full Refunds**, **Partial Offsets**, and **Item-Level Line Returns** with recorded audit justifications.
* **True Net Revenue Tracking:** Calculates `netAmount = total - refundAmount`, guaranteeing accounting ledgers reconcile to the penny.
* **Dual Printing Engine:**
  * **80mm Thermal Receipt:** Optimized for standard POS receipt printers with customer loyalty balances, coupon deductions, and cashier stamp.
  * **Formal A4 GST Invoice:** Commercial tax invoice with GSTIN, CGST/SGST tax slabs, customer information, and printable corporate layout.

### 5. 👑 Executive Suite & Analytics (`/admin`)
* **Real Database Aggregations:** Live metrics for today's net sales, ongoing orders, completed covers, and average order value (AOV).
* **24-Hour Hourly Rush Heatmap:** Visual analysis of peak floor hours to optimize kitchen staff scheduling.
* **Dish Velocity & Margins:** Top revenue-generating dishes with dynamic gross margin percentages.
* **Menu Catalog & Category Editor:** Live dish availability toggling, pricing management, and category display ordering.
* **Coupon Campaign Engine:** Create, activate, and manage promo codes with minimum order thresholds and one-time discount protections.

### 6. 🖨️ Dual-QR Acrylic Table Stand Studio (`/admin/qr-generator`)
* **Print-Ready Table Stands:** Bespoke visual stand generator formatted for acrylic table tents (A4, A5, A6).
* **Dual-QR Integration:** Combines **WPA Guest Wi-Fi Auto-Connect QR** (one tap to connect) alongside **Cryptographic Table Order QR** on a single luxury branded card.
* **Direct Export:** Instant 300 DPI high-resolution PNG export and browser print styling (`@media print`).

---

## 🛡️ Zero-Client-Trust Security Architecture

1. **Authoritative Server Pricing:** Client price and discount inputs are completely stripped. The server computes item totals, verifies coupon eligibility in MongoDB, applies loyalty points caps, and calculates 5% GST authoritatively.
2. **Deep NoSQL Sanitizer:** Recursive request middleware inspects `req.body`, `req.query`, and `req.params`, neutralizing injection operators (`$gt`, `$regex`, `$where`, `__proto__`, `constructor`).
3. **Compound Database Indexing:** Optimized compound indexes on `(tableId, status)`, `(status, paymentStatus)`, `(paymentStatus, paidAt)`, and `createdAt` guarantee sub-millisecond query performance under floor load.
4. **Origin-Allowlist CORS:** Strictly protects API endpoints against unauthorized origins while supporting local LAN testing (`192.168.x.x`) and Vercel cloud domains.
5. **Session & Role Authentication:** JWT authentication with cryptographically enforced secrets (`JWT_SECRET`) and role-based access control (`ADMIN`, `MANAGER`, `OWNER`, `CHEF`, `WAITER`, `CASHIER`).
6. **Graceful Process Lifecycle:** Registered `SIGTERM` and `SIGINT` lifecycle hooks close HTTP listeners and MongoDB connection pools cleanly.

---

## 🛠️ Technical Specifications

| Component | Technology | Rationale |
|:---|:---|:---|
| **Frontend Framework** | React 18, TypeScript (Strict) | Deterministic type safety across menus, cart models, and tickets. |
| **Build & Tooling** | Vite 5, Tailwind CSS 3.4 | Ultra-fast HMR, optimized production tree-shaking, and CSS utility tokens. |
| **State Management** | Zustand (with LocalStorage Sync) | Lightweight, zero-boilerplate client state for multi-device cart sync. |
| **Animation & Motion** | Framer Motion 11 | Hardware-accelerated UI transitions, drawers, and modal backdrops. |
| **Sound Engine** | Web Audio API (Synthesized Chimes) | Dual-tone sine harmonics (587Hz & 880Hz) with 0 network payload. |
| **Mobile Integration** | W3C Web App Manifest (PWA) | Standalone fullscreen kiosk installation on Android, iPad, and desktop. |
| **Backend Runtime** | Node.js 22 LTS, Express 5 | High-throughput asynchronous routing and non-blocking I/O. |
| **Database** | MongoDB Atlas, Mongoose 9 | Scalable document storage with embedded refund histories and compound indexes. |
| **Cloud Deployment** | Dual Mode: Standalone Node / Vercel Serverless | Dedicated Express server on Port 5000 + Serverless Function (`api/index.js`). |

---

## 🚀 Live Station Reference & Default Credentials

| Station | Route | Default Access | Description |
|:---|:---|:---|:---|
| 📱 **Guest Digital Menu** | `/menu` | *Open to all diners* | Dynamic menu, dietary filters, table cart, checkout |
| ⏱️ **Order Tracking Pass** | `/order/:orderId` | *Automatic on checkout* | Live stage tracker (`Received` ➔ `Preparing` ➔ `Ready` ➔ `Served`) |
| 🍳 **Kitchen Pass (KDS)** | `/kitchen` | `chef@aura.com` / `chef123` | High-contrast cooking pass with line-item cancellation |
| 🤵 **Floor Command** | `/waiter` | `waiter@aura.com` / `waiter123` | 30-table layout, audio chimes, service dispatch |
| 💳 **Cashier POS** | `/cashier` | `cashier@aura.com` / `cashier123` | Bill settlement, line-item refunds, thermal & GST print |
| 👑 **Executive Dashboard** | `/admin` | `admin@aura.com` / `admin123` | Net sales, hourly heatmap, dish margins, menu management |
| ⚙️ **Venue Settings** | `/admin/settings` | `admin@aura.com` / `admin123` | Restaurant name, host domain, guest Wi-Fi credentials |
| 🖨️ **QR Table Studio** | `/admin/qr-generator`| `admin@aura.com` / `admin123` | Acrylic dual-QR table stand generator & 300 DPI export |
| 🔐 **Quick Staff Login** | `/login` | Master Code: `AURA2026` | 1-click station switcher for dedicated floor tablets |

---

## 💻 Quickstart & Development Guide

### Prerequisites
* **Node.js**: v20 or v22 LTS ([Download Node.js](https://nodejs.org/))
* **MongoDB**: Local MongoDB instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI

---

### Step 1: Clone & Configure Environment

```bash
# Clone repository
git clone https://github.com/Niranjan-Kumar-Singh/AURA-GASTRONOMY-RESTAURANT.git
cd AURA-GASTRONOMY-RESTAURANT

# Copy environment template
cp .env.example .env
```

Ensure your `.env` contains your MongoDB connection URI and a secure JWT secret:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/aura_restaurant?retryWrites=true&w=majority
JWT_SECRET=aura_enterprise_super_secure_jwt_secret_key_minimum_64_characters_long_2026
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

---

### Step 2: Install Dependencies & Seed Database

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Seed database with artisanal menu catalog, staff roles, and initial tables
npm run seed
```

---

### Step 3: Run the Full-Stack Application

Launch both the **Express Backend (Port 5000)** and **Vite Frontend (Port 5173)** concurrently:

```bash
npm run dev
```

* **Frontend Client:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
* **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Step 4: Verification & Production Build

Verify strict TypeScript compilation, zero-warning linting, and asset bundle generation:

```bash
# Build production bundle
npm run build

# Run backend syntax & server check
npm --prefix backend test
```

---

## 📲 Mobile Ergonomics & PWA Installation

AURA Gastronomy is fully configured as a Progressive Web App (PWA):
1. **Diners**: Scan any table QR stand to open the responsive mobile menu directly in Safari, Chrome, or Samsung Internet without downloading an app.
2. **Floor Staff & Kitchen Monitors**: Open `/waiter` or `/kitchen` on an iPad, Galaxy Tab, or Android terminal, tap **Share / Settings ➔ Add to Home Screen**, and launch AURA as a **standalone, borderless kiosk app**.

---

## 📄 License & Credits

This platform is authored and maintained by **[Niranjan Kumar Singh](https://github.com/Niranjan-Kumar-Singh)** and licensed under the **[MIT License](LICENSE)**. Open for adaptation, commercial deployment, and extension across hospitality venues worldwide.
