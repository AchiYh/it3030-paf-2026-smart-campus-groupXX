# 🏫 Smart Campus Operations Hub

> **IT3030 – Programming Applications and Frameworks**
> SLIIT | Academic Year 2026

A full-stack university campus management system built with **Spring Boot**, **MongoDB**, **React**, and **OAuth2/JWT** authentication.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Team Members](#team-members)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Branch Strategy](#branch-strategy)

---

## 🔍 Overview

The **Smart Campus Operations Hub** streamlines university operations by providing a centralized platform for:

| Module | Owner | Description |
|--------|-------|-------------|
| Facilities & Assets Catalogue | Member 1 | Manage campus resources, rooms, and equipment |
| Booking Management | Member 2 | Handle reservations with conflict detection |
| Maintenance & Incident Ticketing | Member 3 | Track maintenance requests and incidents |
| Authentication & Notifications | Member 4 | OAuth2/JWT auth, role-based access, notifications |

---

## ⚙️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.x
- **Database:** MongoDB
- **Authentication:** OAuth2 + JWT
- **Build Tool:** Maven

### Frontend
- **Framework:** React 18+ (Vite)
- **State Management:** Context API
- **HTTP Client:** Axios
- **Routing:** React Router v6

---

## 👥 Team Members

| Member | Module | Branch |
|--------|--------|--------|
| Member 1 | Facilities & Assets Catalogue | `feature/member1-resources` |
| Member 2 | Booking Management | `feature/member2-bookings` |
| Member 3 | Maintenance & Incident Ticketing | `feature/member3-tickets` |
| Member 4 | Authentication & Notifications | `feature/member4-auth` |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MongoDB 6+
- Maven 3.8+

### Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📡 API Documentation

Once the backend is running, access the API docs at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## 🌿 Branch Strategy

```
main
├── develop
│   ├── feature/member1-resources
│   ├── feature/member2-bookings
│   ├── feature/member3-tickets
│   └── feature/member4-auth
```

### Rules
1. Never push directly to `main` or `develop`
2. Create feature branches from `develop`
3. Submit Pull Requests for code review
4. Minimum 1 approval required before merge
5. Resolve merge conflicts locally before pushing

---

## 📄 License

This project is developed for academic purposes as part of the IT3030 module at SLIIT.
