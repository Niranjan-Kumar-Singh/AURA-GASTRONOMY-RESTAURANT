# AURA Digital Dining - Enterprise Restaurant Digitalization Platform

> **AURA** (*"Atmospheric Table-Side Digitalization & Gastronomy Platform"*) is a modern, enterprise-grade full-stack SaaS solution for high-end restaurants. It streamlines customer table-side QR code ordering, real-time Kitchen Display Systems (KDS), waiter workflow dispatch, cashier POS bill settlement, and executive business analytics.

---

## 🌟 Key Features

- 📱 **Customer Table-Side QR Session**: Scan table QR code to instantly view high-resolution menu, customize dish modifiers, place table orders, track live kitchen prep timeline, and request waiter assistance.
- 🍳 **Kitchen Display System (KDS)**: Real-time STOMP WebSocket ticket board for chefs with color-coded order urgency timers and one-tap status management.
- 💁 **Waiter Workflow Hub**: Interactive table occupancy grid, instant order dispatch, call-waiter alert notifications.
- 💳 **Cashier POS & Settlement**: Bill splitting, UPI/Card/Cash transaction settlement, invoice printing.
- 📊 **Executive Analytics**: Real-time sales velocity graphs, popular dish reports, and menu item availability management.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite + TypeScript 5
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion
- **State**: Zustand (Client UI State) + TanStack Query v5 (Server Async State)
- **Forms & Validation**: React Hook Form + Zod

### Backend
- **Runtime**: Java 21 (LTS) + Spring Boot 3.x
- **Security**: Spring Security 6 + Stateless JWT Pair
- **ORM & Persistence**: Spring Data JPA + Hibernate 6 + PostgreSQL
- **Real-Time Messaging**: Spring WebSocket + STOMP Broker
- **Mapping & Utilities**: MapStruct + Lombok + OpenAPI 3.0 (Swagger)

---

## 📁 Repository Structure

```
Restaurant/
├── frontend/             # React 19 + Vite + TypeScript Frontend
├── backend/              # Spring Boot 3 + Java 21 REST API Backend
├── database/             # Schemas, Flyway Migrations, Seed Data
├── docs/                 # Complete Architecture & Development Specifications
├── design/               # Design Tokens & UI Guidelines
├── assets/               # Production Static Brand Assets & Icons
├── api/                  # OpenAPI 3.0 Specs & Postman Collections
├── prompts/              # AI Agent Guidance Specs
├── scripts/              # Development Setup Scripts
├── docker/               # Docker & Docker Compose Configurations
└── .github/              # GitHub Actions CI/CD Workflows
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: `v20+` & `npm v10+`
- **Java Development Kit (JDK)**: `Java 21`
- **Maven**: `v3.9+`
- **PostgreSQL**: `v16+`

### 1. Database Setup
```bash
# Ensure PostgreSQL server is running, then create database:
createdb restaurant_db
```

### 2. Backend Setup
```bash
cd backend
# Run Flyway migrations and start Spring Boot service
mvn spring-boot:run
```
Backend server starts on `http://localhost:8080` (OpenAPI Swagger at `http://localhost:8080/swagger-ui.html`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend app starts on `http://localhost:5173`.

---

## 📜 Development Standards & Constitution
All contributions must adhere to the engineering rules defined in [`docs/coding-standards/CONSTITUTION.md`](file:///d:/Web%20Development/Restaurant/docs/coding-standards/CONSTITUTION.md).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
