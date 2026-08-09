# AURA Digital Dining

# Phase 2.65

# Part 1 — Business Vision, Restaurant Foundation & Master Software Blueprint

### Master Product Requirement Document (PRD)

---

# 1. Document Information

## Document Name

AURA Digital Dining Platform – Business Vision, Restaurant Foundation & Master Software Blueprint

---

## Version

```
Version : 1.0 (Comprehensive Engineering Blueprint Edition)
Phase   : 2.65
Part    : 1
Status  : Approved for Production Implementation
```

---

## Purpose

This document establishes the comprehensive business foundation and technical blueprint of the AURA Digital Dining Platform.

It defines:

* Why this product exists
* What business problem it solves
* How a real commercial restaurant operates
* Who the primary stakeholders and users are
* Precise quantitative business objectives and success criteria
* What is strictly In-Scope vs Out-of-Scope for Version 1.0
* Technical stack constraints, security principles, UI philosophy, and coding standards
* Comprehensive repository architecture and folder structure
* Version roadmap and strict Definition of Done (DoD)
* Single source of truth for all engineers, designers, testers, and AI agents.

---

# 2. Product Vision

## Vision Statement

Build a modern, premium, enterprise-grade digital dining platform that completely replaces paper menus and manual restaurant operations while providing an exceptional customer experience from the moment a guest enters the restaurant until they leave.

The platform feels like a real commercial SaaS product comparable in quality to Toast POS, Square POS, Oracle MICROS, Foodics, and modern consumer applications.

It is suitable for:

* Real commercial restaurant operations
* Portfolio showcase
* Software engineering architecture interviews
* Future multi-tenant SaaS expansion

---

# 3. Mission

The mission of AURA is:

> Transform every restaurant visit into a seamless, beautiful, intelligent, and digital-first dining experience.

Instead of customers waiting for menus, searching for waiters, or manually requesting bills, every interaction should be accessible digitally while still enabling staff to provide warm, premium hospitality.

---

# 4. Problem Statement

Traditional restaurants face severe operational bottlenecks across all roles.

## Customer Problems

* Waiting for waiters to bring physical menus.
* Dirty, outdated, damaged, or unhygienic paper menus.
* Inability to filter menu items by dietary preferences or allergens.
* Lack of personalized recommendations or dish previews.
* No order history memory across visits.
* Lengthy wait times to request bills or place additional items.
* Fragmented or slow payment processing.
* No digital order tracking or live status visibility.
* Lack of integrated rewards or loyalty incentives.

---

## Waiter Problems

* Repetitive manual order taking and handwritten slips.
* Frequent miscommunication with the kitchen staff.
* Forgetting table customization notes or dietary restrictions.
* Difficulty managing multiple active tables during peak rush.
* Manual and error-prone bill requests and split calculations.

---

## Kitchen Problems

* Hard-to-read handwritten tickets.
* Missing or ambiguous customization notes.
* Chaos and ticket loss during peak rush hours.
* Inability to track preparation elapsed times accurately.
* Difficulty prioritizing orders across tables.

---

## Cashier Problems

* Slow manual bill calculations and tax additions.
* Split bill confusion and payment discrepancies.
* Accidental duplicate payment processing.
* Inability to track pending vs settled table balances.

---

## Owner Problems

* Zero real-time operational or financial visibility.
* Absence of automated sales and category analytics.
* Manual, time-consuming end-of-day reconciliation reports.
* Inability to measure staff response time and kitchen performance.
* Lack of customer retention and feedback insights.

---

# 5. Product Goals

The system must achieve the following core goals:

* **Goal 1**: Eliminate paper menus completely.
* **Goal 2**: Digitize the end-to-end table dining lifecycle.
* **Goal 3**: Reduce routine waiter dependency for order taking.
* **Goal 4**: Maximize kitchen ticket throughput and prep accuracy.
* **Goal 5**: Provide live, real-time WebSocket order status tracking.
* **Goal 6**: Elevate customer satisfaction ratings.
* **Goal 7**: Boost restaurant revenue via upsells, combos, and smart AI recommendations.
* **Goal 8**: Deliver enterprise-grade management and owner analytics.
* **Goal 9**: Showcase world-class, luxury design aesthetic and interaction UX.
* **Goal 10**: Enforce production-grade software architecture, type safety, and test coverage.

---

# 6. Target Audience

The platform serves 7 distinct primary user roles:

### Customer
A guest dining at the restaurant table.
* **Capabilities**: Scan QR, browse digital menu, customize items, place orders, request waiter service, track prep timeline, pay digitally, provide rating & feedback.

---

### Waiter
Service staff managing table dining experience.
* **Capabilities**: View occupancy grid, dispatch table orders, receive live waiter call alerts, update item delivery state, print interim check slips.

---

### Chef / Kitchen Staff
Culinary team handling food preparation.
* **Capabilities**: View real-time KDS board, monitor dish prep timers, update status (`Received` $\rightarrow$ `Preparing` $\rightarrow$ `Ready`), manage item availability out-of-stock toggles.

---

### Cashier
Front-of-house financial controller.
* **Capabilities**: View pending table bills, perform itemized or split bill settlements, accept Cash/UPI/Card payments, issue GST tax invoices, process refunds.

---

### Manager
Floor operations and staff supervisor.
* **Capabilities**: Monitor real-time table state grid, assign tables, override order items or cancellations, manage table reservations, resolve customer issues.

---

### Admin
System and catalog administrator.
* **Capabilities**: Manage digital menu categories, items, pricing, tax rates, modifier groups, staff user accounts, dynamic QR code generation, restaurant configuration.

---

### Owner
Executive business owner.
* **Capabilities**: High-level revenue dashboards, sales velocity reports, popular dish analytics, labor performance metrics, net profit margins, customer retention graphs.

---

# 7. Restaurant Identity

The platform is designed specifically for **AURA Fine Dining**.

## Identity Metadata

```text
Restaurant Name : AURA Fine Dining
Tagline         : Where Exceptional Cuisine Meets Intelligent Dining
Location        : 100 Feet Road, Indiranagar, Bengaluru, Karnataka, India - 560038
Operating Hours : Monday - Sunday | 11:00 AM – 11:30 PM
Guest Capacity  : 120 Guests
Total Tables    : 30 Tables
Dining Zones    : Main Hall (12 Tables)
                  VIP Lounge (4 Tables)
                  Outdoor Garden (8 Tables)
                  Family Section (6 Tables)
Table Types     : 2-Seater, 4-Seater, 6-Seater, 8-Seater, Private Dining Suite
Contact Channels: Phone, Email, Web, Instagram, Google Maps, WhatsApp
```

---

# 8. Restaurant Branding & Design System

The visual identity embodies modern luxury, minimal elegance, and warm hospitality.

## Brand Color Tokens

```text
Primary   (Luxury Gold) : #D4AF37
Secondary (Obsidian)    : #0B0B0F
Accent    (Emerald)     : #10B981
Surface   (Dark Velvet) : #16161E
Text      (Pure Ivory)  : #F8FAFC
Muted     (Warm Taupe)  : #A1A1AA
```

---

## Typography Standards

```text
Display & Headings : Playfair Display (Serif, Elegant)
Body & Interfaces  : Inter (Sans-Serif, Modern)
Data & Numbers     : JetBrains Mono (Monospace, Precise)
```

---

## Brand Personality

* **Elegant**: Sophisticated visual hierarchy with gold accents on dark obsidian canvas.
* **Modern**: Subtle glassmorphism, dynamic fluid transitions, zero clunky borders.
* **Luxury**: Polished typography, high-resolution food imagery, tactile feedback.
* **Warm Hospitality**: Thoughtful micro-animations, clear messaging, effortless interactions.

---

# 9. Business Model

AURA supports multiple revenue and service channels:

* **Dine-In**: Core primary operational workflow (QR Table Ordering).
* **Table Reservation**: Pre-booking tables with advance slot allocation.
* **Takeaway**: Future-ready digital pickup ordering.
* **Delivery**: Future-ready fleet and aggregator integration.
* **Catering**: Future-ready event order booking.
* **VIP Membership**: Integrated guest loyalty and rewards program.

---

# 10. Business Rules

The following core rules govern the application globally:

* **Rule 1 (Session Uniqueness)**: Exactly one active dining session per table at any time.
* **Rule 2 (Multi-Order Session)**: A single dining session supports multiple sequential orders (rounds) before final settlement.
* **Rule 3 (Order Lock)**: An order item cannot be cancelled or edited once kitchen status transitions to `PREPARING`.
* **Rule 4 (Completion Permanence)**: Completed/delivered orders cannot be voided without Manager administrative override.
* **Rule 5 (Session Closure)**: A dining session remains active until full bill payment is verified and cleared by Cashier POS.
* **Rule 6 (QR Obfuscation)**: QR codes must encode cryptographically signed dynamic tokens; table IDs are never exposed as raw integer route parameters.
* **Rule 7 (Entity Ownership)**: Every order entity adheres strictly to hierarchy: `Restaurant` $\rightarrow$ `Branch` $\rightarrow$ `Table` $\rightarrow$ `DiningSession` $\rightarrow$ `Customer` $\rightarrow$ `Order`.
* **Rule 8 (Tax & Compliance)**: Every payment triggers automated generation of an itemized GST invoice with tax breakdown.
* **Rule 9 (Privilege Isolation)**: Kitchen display interfaces are restricted from viewing payment or bill settlement data.
* **Rule 10 (Access Enforcement)**: Guest customers cannot access administrative endpoints or internal staff routes under any circumstances.

---

# 11. High-Level System Architecture & Modules

```
                              ┌────────────────────────┐
                              │     Landing Website    │
                              └───────────┬────────────┘
                                          │
                              ┌───────────▼────────────┐
                              │  Customer Portal (QR)  │
                              └───────────┬────────────┘
                                          │
      ┌───────────────────────────────────┼───────────────────────────────────┐
      │                                   │                                   │
┌─────▼──────┐                    ┌───────▼──────┐                    ┌───────▼──────┐
│Digital Menu│                    │ Cart & Order │                    │ Reservations │
└─────┬──────┘                    └───────┬──────┘                    └───────┬──────┘
      │                                   │                                   │
      └───────────────────────────────────┼───────────────────────────────────┘
                                          │
                               ┌──────────▼───────────┐
                               │   Payments & Bills   │
                               └──────────┬───────────┘
                                          │
      ┌───────────────────────────────────┼───────────────────────────────────┐
      │                                   │                                   │
┌─────▼──────┐                    ┌───────▼──────┐                    ┌───────▼──────┐
│  KDS Board │                    │ Waiter Hub   │                    │ Cashier POS  │
└─────┬──────┘                    └───────┬──────┘                    └───────┬──────┘
      │                                   │                                   │
      └───────────────────────────────────┼───────────────────────────────────┘
                                          │
      ┌───────────────────────────────────┼───────────────────────────────────┐
      │                                   │                                   │
┌─────▼──────┐                    ┌───────▼──────┐                    ┌───────▼──────┐
│ Admin Hub  │                    │ Owner Analytics│                   │ Inventory    │
└────────────┘                    └──────────────┘                    └──────────────┘
```

---

# 12. Key Performance Indicators (KPIs)

The platform actively tracks and measures:

* **Daily Orders & Volume**: Total order tickets per day per zone.
* **Average Order Value (AOV)**: Revenue divided by completed dining sessions.
* **Table Turnover Speed**: Average duration from QR scan session start to table settlement.
* **Kitchen Ticket Prep Time**: Average elapsed time from `RECEIVED` to `READY` state.
* **Waiter Alert Response SLA**: Average duration to acknowledge a customer call alert.
* **Payment Success Rate**: Percentage of seamless digital transactions on first attempt.
* **Customer Retention Rate**: Percentage of registered guests returning within 30 days.
* **Upsell Conversion Rate**: Percentage of orders accepting smart combo recommendations.

---

# 13. System Scope Matrix

## Version 1.0 (In-Scope)

* **QR Code Dining**: Dynamic session generation, encrypted table QR tokens.
* **Customer Table App**: Menu browsing, search, dish detail popups, modifier selection, cart management, instant order placement, live WebSocket order timeline, call waiter button.
* **Kitchen Display System (KDS)**: Ticket queue grid, order prep status updates (`RECEIVED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY`), elapsed timer alerts, dish availability toggles.
* **Waiter Workflow Hub**: Occupancy matrix, instant order dispatch, notification center for waiter call alerts, item delivery marking (`DELIVERED`).
* **Cashier POS Station**: Table bill generation, split bill calculations (By Item / By Person), payment clearing (Cash / UPI / Card / Gateway), automated GST invoice generation.
* **Admin Management Hub**: Full CRUD for Categories, Items, Variants, Modifiers, Tables, Zones, Staff Users, Tax Rules.
* **Owner Executive Dashboard**: Revenue counters, sales velocity bar graphs, popular dish pie charts, category breakdown tables.
* **Table Reservations**: Guest table booking calendar, guest details, slot management.
* **Security & Auth**: Spring Security 6, JWT Access/Refresh tokens, RBAC, encrypted passwords.

---

## Version 2.0+ (Out-of-Scope for v1.0)

* Multi-tenant multi-branch SaaS management.
* Third-party delivery aggregator integration (Swiggy / Zomato).
* Native iOS / Android Mobile Apps.
* AI Voice-Activated Table Ordering.
* Automatic Supplier Purchase Order (PO) triggers.
* Payroll, staff attendance, and tip distribution logic.
* Full ERP & Enterprise Accounting software integrations.

---

# 14. Non-Functional Requirements (NFRs)

* **Performance**: First Contentful Paint (FCP) $< 1.2\text{s}$, API response times $< 100\text{ms}$ (p95).
* **Real-Time Responsiveness**: WebSocket latency $< 50\text{ms}$ for KDS and Waiter ticket dispatches.
* **Availability**: 99.9% uptime target during operating hours (11:00 AM – 11:30 PM).
* **Security**: Zero clear-text credentials, HTTPS/TLS 1.3 enforced, OWASP Top 10 compliance.
* **Accessibility**: WCAG 2.1 Level AA compliance across customer-facing web screens.
* **Code Quality**: Strict TypeScript, 0 compiler warnings, Spring Boot domain boundary adherence.

---

# 15. Stakeholders & User Roles

| Stakeholder Role | Primary Responsibilities | Core Success Criteria |
| :--- | :--- | :--- |
| **Restaurant Owner** | Business growth, profitability, brand equity | Increased AOV, automated reports, clear financial metrics |
| **Restaurant Manager** | Daily floor management, table assignment, customer satisfaction | Zero floor bottlenecks, rapid table reset, resolved complaints |
| **Kitchen Staff (Chefs)** | Food preparation, recipe compliance, prep speed | Clear ticket instructions, zero lost slips, accurate timers |
| **Waiters** | Guest hospitality, order delivery, table assistance | Fast call alerts, reduced foot travel, smooth bill handoff |
| **Customers** | Dining, dish selection, ordering, bill payment | Fast ordering, accurate dishes, instant digital payment |
| **Software Developers** | System implementation, maintenance, clean code | Clean layer isolation, maintainable code, fast builds |
| **QA Engineers** | Quality validation, test execution, regression control | Zero critical bugs in production, repeatable test suite |

---

# 16. Measurable Business Objectives

The implementation must achieve the following quantitative benchmarks:

* **Objective 1 (Order Value)**: Increase Average Order Value (AOV) by **15%** via intelligent upsell recommendations.
* **Objective 2 (Waiter SLA)**: Reduce waiter table call response time to **under 2 minutes**.
* **Objective 3 (Order Accuracy)**: Reduce order item customization mistakes by **90%**.
* **Objective 4 (Settlement Speed)**: Reduce bill generation and payment settlement time to **under 30 seconds**.
* **Objective 5 (Repeat Visits)**: Boost customer repeat visit rate by **25%** through loyalty rewards.
* **Objective 6 (CSAT Rating)**: Maintain an average customer satisfaction score above **4.8 / 5.0 stars**.
* **Objective 7 (Digital Adoption)**: Achieve **100% digital order capture** for table dine-in sessions.
* **Objective 8 (Sustainability)**: Reduce physical paper consumption by **95%**.

---

# 17. Success Definition for Version 1.0

Version 1.0 is deemed successful and production-ready when:

1. A guest can scan a table QR code on their smartphone and load the menu in $< 1.5$ seconds without downloading an app.
2. Orders placed on the guest app appear instantaneously ($< 100\text{ms}$) on the Kitchen Display System (KDS) board.
3. Chefs can update dish prep status with a single tap, updating the customer's timeline in real time over WebSockets.
4. Waiters receive instant auditory and visual notifications for "Call Waiter" alerts on their dashboard grid.
5. Cashiers can settle bills via UPI, Card, or Cash in $< 30$ seconds with auto-generated GST invoices.
6. Owners can open their executive portal and inspect live daily revenue, AOV, and best-selling dishes accurately.
7. The platform executes cleanly with **zero critical or high-severity open bugs**, passing all automated test suites.

---

# 18. Explicit System Scope Boundaries

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IN-SCOPE (VERSION 1.0)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Dynamic QR Code Table Session Management                                 │
│  • Customer Self-Ordering App with Customizers & Cart                       │
│  • Real-Time STOMP/WebSocket Kitchen Display System (KDS)                   │
│  • Waiter Table Occupancy Grid & Dispatch Alerts                            │
│  • Cashier POS & Bill Split Settlement (Cash/UPI/Card)                      │
│  • Full Item, Category, Modifier & User Admin Management                    │
│  • Executive Business Analytics & Financial Reporting                       │
│  • Table Reservations Engine & Guest Calendar                               │
│  • Loyalty Rewards Basics & User Accounts                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OUT-OF-SCOPE (VERSION 2.0+)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Swiggy / Zomato Delivery Aggregator Integration                          │
│  • Native Mobile Apps (iOS Swift / Android Kotlin)                          │
│  • AI Voice Recognition Order Engine                                        │
│  • Automatic Supplier PO & Raw Ingredient Inventory Auto-Purchase           │
│  • Staff Payroll, Attendance & Tip Distribution                             │
│  • Multi-Tenant Multi-Branch SaaS Management                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 19. Operational Assumptions

* **Assumption 1**: The restaurant provides reliable high-speed Wi-Fi and internet connectivity across all dining zones.
* **Assumption 2**: Every physical table has a permanently mounted, unique, dynamic QR code card.
* **Assumption 3**: The kitchen is equipped with at least one touchscreen tablet or commercial monitor running the KDS.
* **Assumption 4**: The front-desk cashier possesses a terminal computer or desktop monitor connected to a receipt printer.
* **Assumption 5**: Dining guests possess a modern smartphone capable of reading standard QR codes.
* **Assumption 6**: Tax configurations (GST 5%, 18%) are managed dynamically via Admin settings.
* **Assumption 7**: Digital payment processing relies on standard integrated payment gateway APIs.

---

# 20. Operational & Technical Constraints

* **Constraint 1 (Single Branch)**: Version 1.0 targets a single physical restaurant location (AURA Indiranagar).
* **Constraint 2 (Table Capacity)**: System optimized for a maximum of 30 tables and 120 simultaneous guests.
* **Constraint 3 (Language Support)**: UI strings and menu content localized exclusively in English for v1.0.
* **Constraint 4 (Single Kitchen Queue)**: Single consolidated kitchen display queue (no separate bar/bakery routing in v1.0).
* **Constraint 5 (Single Database)**: Operational store centralized in a single PostgreSQL instance.
* **Constraint 6 (Online Required)**: Requires active network connection; offline order queuing is disabled in v1.0.

---

# 21. Technology Selection & Architectural Rationale

## Frontend Architecture

* **React 19**: Component model with server components readiness and optimized hook execution.
* **TypeScript 5**: Strict end-to-end type safety preventing runtime undefined/null errors.
* **Vite**: Ultra-fast Module HMR build tool optimizing developer feedback loop.
* **Tailwind CSS v4**: Utility-first CSS engine allowing zero runtime overhead and luxury dark theme design tokens.
* **Framer Motion**: Production-grade physics animation library for 60fps micro-interactions.
* **Zustand**: Lightweight, unopinionated client UI state management for cart and local session.
* **TanStack Query v5**: Industry-standard async server state management with automatic caching and refetching.

---

## Backend Architecture

* **Java 21 (LTS)**: High-performance enterprise runtime utilizing Virtual Threads (Project Loom) for high concurrency.
* **Spring Boot 3.x**: Robust enterprise framework providing dependency injection, data access, and REST controllers.
* **Spring Security 6 + JWT**: Stateless security architecture enforcing role-based authorization rules.
* **Spring Data JPA & Hibernate 6**: Strongly-typed ORM layer managing transactional persistence.
* **MapStruct**: Zero-reflection compile-time DTO-Entity mapping generator.
* **Flyway Database Migrations**: Version-controlled SQL migration scripts guaranteeing schema consistency across environments.

---

## Persistence & Infrastructure

* **PostgreSQL 16**: Relational ACID database handling orders, sessions, menus, and user transactions.
* **Docker & Docker Compose**: Containerized setup ensuring identical development, testing, and production runtime environments.
* **Nginx**: High-performance reverse proxy handling SSL termination and static web asset serving.

---

# 22. Security Architecture & Threat Mitigation

* **Authentication**: Stateless JWT token pairs (Short-lived Access Token + Secure HTTP-only Refresh Token).
* **Password Security**: All user credentials hashed using BCrypt (`strength = 12`) with random salt.
* **QR Table Security**: Dynamic signed session tokens. Direct table primary keys (`/table/5`) are strictly forbidden.
* **Role-Based Access Control (RBAC)**: Fine-grained annotations (`@PreAuthorize("hasRole('ADMIN')")`) on backend APIs.
* **Input Validation**: All incoming REST request DTOs validated using Jakarta Bean Validation (`@NotNull`, `@Size`, `@Pattern`).
* **SQL Injection Defense**: Standard JPA repositories and parameterized SQL queries exclusively; zero raw string concatenation.
* **XSS Prevention**: React auto-escaping UI strings combined with DOMPurify sanitization for rich text HTML.
* **CSRF & Rate Limiting**: Token-based API authorization combined with bucket-based rate limiting on sensitive auth endpoints.
* **Audit Trail**: Operational entities extend `BaseEntity` recording `created_by`, `created_at`, `updated_by`, `updated_at`.

---

# 23. UI & Interaction Philosophy

## Design System Principles

* **Luxury Dark Palette**: Rich Obsidian backgrounds paired with warm Gold accents and crisp Ivory typography.
* **Tactile Feedback**: Every button click, tap, or status change fires immediate visual ripple or state transformation.
* **Performance Budget**: All micro-animations and page transitions complete within **150ms – 250ms**.
* **Zero Empty Screens**: Every view explicitly designs all **7 Core UI States**:
  1. `Initial` (Default entry state)
  2. `Loading` (Content skeleton shimmering)
  3. `Empty` (Helpful illustration + action button)
  4. `Error` (User-friendly message + retry trigger)
  5. `Success` (Data presentation with smooth entrance)
  6. `Offline` (Network disconnect banner)
  7. `Unauthorized` (Clear privilege access denied prompt)

---

# 24. Engineering Coding Standards

## Frontend Standards (React + TypeScript)

* **Strict Types**: No implicit `any`. All props, functions, hooks, and store states explicitly typed.
* **Component Encapsulation**: Single component per file. Interface declared immediately above component.
* **Zero Inline Styles**: All styling declared via Tailwind utility classes.
* **Custom Hooks**: Business logic and data queries isolated inside dedicated hooks in `/hooks` or `/features/<feature>/hooks`.

---

## Backend Standards (Java 21 + Spring Boot 3)

* **Strict Layering**: `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Entity`. No layer skipping.
* **Constructor Injection**: Field injection (`@Autowired`) strictly prohibited. Use `@RequiredArgsConstructor`.
* **Immutable DTOs**: All request payloads and response DTOs constructed using Java 21 `record` types.
* **Domain Exceptions**: Raw exceptions never exposed to clients. Custom domain exceptions caught by `@RestControllerAdvice`.
* **Transactional Discipline**: Service state mutations annotated with `@Transactional(rollbackFor = Exception.class)`.

---

# 25. Standard Repository Architecture

```text
Restaurant/
├── frontend/                     # React 19 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── assets/               # Branding graphics, icons, logos
│   │   ├── components/           # Shared UI component library (buttons, modals, cards)
│   │   ├── config/               # App configuration & environment constants
│   │   ├── features/             # Feature-based modular slices
│   │   │   ├── admin/            # Category, item, menu & user management
│   │   │   ├── cashier/          # POS settlement, billing & invoice printing
│   │   │   ├── customer/         # QR Menu, cart, checkout & live order timeline
│   │   │   ├── kitchen/          # Kitchen Display System (KDS) live ticket grid
│   │   │   ├── owner/            # Business analytics & revenue dashboards
│   │   │   └── waiter/           # Table occupancy grid & dispatch alerts
│   │   ├── hooks/                # Global reusable React hooks
│   │   ├── layouts/              # Main, Admin, KDS, POS layout wrappers
│   │   ├── routes/               # React Router v7 configuration & protected routes
│   │   ├── services/             # Axios API client setup & WebSocket STOMP handlers
│   │   ├── store/                # Zustand client UI state stores
│   │   ├── types/                # Global TypeScript definitions & API DTO contracts
│   │   └── utils/                # Helper utilities (currency formatting, date formatters)
│   └── package.json
│
├── backend/                      # Spring Boot 3 + Java 21 REST API Backend
│   ├── src/main/java/com/aura/
│   │   ├── config/               # Security, CORS, WebSocket STOMP & Swagger config
│   │   ├── controller/           # REST API Controllers exposing OpenAPI endpoints
│   │   ├── dto/                  # Java 21 Record DTOs (Request / Response payloads)
│   │   ├── entity/               # JPA Entities mapping database schema
│   │   ├── exception/            # BaseDomainException & @RestControllerAdvice handler
│   │   ├── mapper/               # MapStruct mapper interfaces
│   │   ├── repository/           # Spring Data JPA Repository interfaces
│   │   ├── security/             # JWT token provider, filter & user details service
│   │   └── service/              # Core business logic services & transactions
│   └── pom.xml
│
├── database/                     # PostgreSQL Migrations & Seed Scripts
│   ├── migrations/               # Flyway SQL migration scripts (V1__init.sql)
│   └── seeds/                    # Sample restaurant menu, table & staff seed data
│
├── docs/                         # Comprehensive Master Documentation
│   ├── prd/                      # Master Product Requirement Documents
│   ├── architecture/             # C4 Diagrams & System Data Flow Specs
│   ├── coding-standards/         # Engineering Constitution & Code Rules
│   └── api/                      # OpenAPI 3.0 specs & Postman collections
│
├── design/                       # Design System & Brand Tokens
│   └── tokens/                   # JSON theme tokens (colors, typography, spacing)
│
├── docker/                       # Dockerfile & Docker Compose configurations
├── scripts/                      # Developer setup & database reset shell scripts
└── .github/                      # CI/CD Workflows (Linting, Vitest, JUnit testing)
```

---

# 26. Version Release Roadmap

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VERSION 1.0 (CURRENT)                             │
│       Complete Table QR Dining, KDS, POS, Admin & Owner Dashboard           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                VERSION 1.5                                  │
│       Ingredient Stock Tracking & Low-Stock Alerts Engine                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                VERSION 2.0                                  │
│       Takeaway Ordering & Swiggy/Zomato Aggregator Integration              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                VERSION 3.0                                  │
│       Multi-Branch Franchise Architecture & Regional Analytics              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                VERSION 4.0                                  │
│       SaaS Multi-Tenant Enterprise Platform & AI Sales Forecasting          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 27. Definition of Done (DoD)

A feature or user story is considered **100% Done** only when all of the following conditions are met:

1. **UI Execution**: React components built according to design tokens, fully responsive across Mobile, Tablet, and Desktop screens.
2. **Backend Execution**: Spring Boot service methods and REST endpoints implemented with strict layer separation.
3. **Data Integrity**: Database tables, foreign keys, and indexes updated via Flyway migration scripts.
4. **Validation**: All form inputs and DTO payloads validated with user-friendly error feedback.
5. **State Completeness**: Component handles all 7 Core UI States (`Initial`, `Loading`, `Empty`, `Error`, `Success`, `Offline`, `Unauthorized`).
6. **Error Handling**: Graceful error catching via `@RestControllerAdvice` and frontend toast notifications.
7. **Security Enforced**: Endpoint access restricted using Spring Security role checks.
8. **Automated Testing**: Unit tests (JUnit 5 + Mockito on backend, Vitest + RTL on frontend) passing with $\ge 80\%$ line coverage.
9. **Code Quality**: Zero linter errors, zero TypeScript compilation warnings, formatted cleanly.
10. **Documentation**: API endpoints documented in Swagger/OpenAPI spec; user story updated in documentation.

---

# 28. Universal Quality & UX Standards

Every single page and user interface component must satisfy the following quality matrix:

* [x] **Fully Responsive**: Seamless layout adaptivity across screens ($320\text{px}$ to $3840\text{px}$).
* [x] **Keyboard Navigable**: All interactive elements reachable via `Tab` key with visible focus rings.
* [x] **Error Boundary Guarded**: Unhandled React crashes caught gracefully by component boundaries.
* [x] **Skeleton Shimmer**: Loading states present content skeletons matching real layout dimensions.
* [x] **Empty State Guidance**: Empty lists provide actionable copy and explicit CTA buttons.
* [x] **Toast Feedback**: All user actions (add to cart, order dispatch, status change) trigger instant success/error toasts.
* [x] **Accessibility (WCAG AA)**: Color contrast ratio $\ge 4.5:1$, aria labels present on icon-only buttons.

---

# 29. Part 1 Master Approval Checklist

This Master Business Vision & Technical Blueprint is finalized when all 35 verification items are satisfied:

### Business & Vision
- [x] 1. Restaurant vision statement clearly defines enterprise digital platform goals.
- [x] 2. Customer, Waiter, Kitchen, Cashier, and Owner problem statements fully documented.
- [x] 3. Measurable quantitative business objectives defined (AOV, Waiter SLA, Error reduction).
- [x] 4. Success criteria for Version 1.0 release explicitly enumerated.

### Identity & Branding
- [x] 5. Restaurant identity (AURA Fine Dining, Indiranagar, 120 capacity) finalized.
- [x] 6. Dining zones (Main Hall, VIP Lounge, Garden, Family) and 30 table breakdown specified.
- [x] 7. Luxury Gold (`#D4AF37`), Obsidian (`#0B0B0F`), and Emerald (`#10B981`) color tokens locked.
- [x] 8. Playfair Display, Inter, and JetBrains Mono typography hierarchy defined.

### Architecture & Scope
- [x] 9. High-level module architecture diagram mapped.
- [x] 10. Strict In-Scope vs Out-of-Scope boundaries established for Version 1.0.
- [x] 11. Core global business rules (1 session/table, order locking, session closure) specified.
- [x] 12. Primary stakeholder matrix and responsibilities documented.

### Technical & Security
- [x] 13. React 19 + TypeScript + Vite + Tailwind CSS v4 frontend stack justified.
- [x] 14. Java 21 + Spring Boot 3 + PostgreSQL backend stack justified.
- [x] 15. Security architecture (JWT, BCrypt, RBAC, QR token obfuscation) documented.
- [x] 16. Operational constraints and system assumptions explicitly declared.

### Design & Quality Standards
- [x] 17. UI design philosophy and 150-250ms interaction budget defined.
- [x] 18. Mandatory 7 Core UI States (`Initial`, `Loading`, `Empty`, `Error`, `Success`, `Offline`, `Unauthorized`) specified.
- [x] 19. Strict Definition of Done (DoD) checklist established for all user stories.
- [x] 20. Universal UX quality standards (Accessibility WCAG AA, Skeleton shimmer, Toasts) enforced.

### Organization & Roadmap
- [x] 21. Standard repository directory structure documented.
- [x] 22. Frontend and backend coding conventions defined.
- [x] 23. Multi-version release roadmap (v1.0 through v4.0) mapped.
- [x] 24. Design system theme tokens saved to [`theme.json`](file:///d:/Web%20Development/Restaurant/design/tokens/theme.json).
- [x] 25. Master PRD saved to [`Phase_2.65_Part_1_Business_Vision.md`](file:///d:/Web%20Development/Restaurant/docs/prd/Phase_2.65_Part_1_Business_Vision.md).

---

# Next Part (Part 2 Preview)

The next document will be **"Real Restaurant Workflow & Complete Customer Lifecycle"** and will go into exhaustive detail, including:

* Minute-by-minute customer journey from entering the restaurant to leaving.
* Walk-in customer vs reservation flow.
* Host and table assignment.
* QR code scanning and secure dining session creation.
* Guest checkout vs registered customer flow.
* Waiter interactions, kitchen processing, payment, receipt generation, feedback, loyalty, and session closure.
* Positive scenarios, negative scenarios, and edge cases for every step.
