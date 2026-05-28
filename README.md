<div align="center">
  
# SESMOS
### *Enterprise Management Dashboard & Real-time Chat Application*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Color Palette](#-color-palette)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [API Integration](#-api-integration)
- [Developer](#-developer)
- [License](#-license)

---

## 🎯 Overview

**Henri Fraise Frontend** is a modern, enterprise-grade web application built for agricultural equipment management. It provides real-time analytics dashboard and instant messaging system, enabling efficient business operations and team collaboration.

> *"Empowering agricultural businesses with data-driven insights and seamless communication"*

---

## ✨ Key Features

### 📊 Dashboard Analytics
| Feature | Description |
|---------|-------------|
| **Real-time KPIs** | Track revenue, sales, product count & equipment availability |
| **Interactive Charts** | Bar, Line, and Area charts with period filtering |
| **Top Products** | Best-selling products with revenue metrics |
| **Regional Map** | Geographic sales distribution |
| **Equipment Stats** | Live equipment status tracking |
| **Excel Export** | One-click report generation |

### 💬 Chat System
| Feature | Description |
|---------|-------------|
| **Real-time Messaging** | WebSocket-powered instant communication |
| **Private & Group Chats** | Flexible conversation types |
| **User Mentions** | `@` mentions with autocomplete |
| **Message Reactions** | Emoji reactions on messages |
| **Delete Messages** | For self or everyone |
| **Typing Indicators** | Live typing status |
| **Online Status** | User presence tracking |

### 🔐 Security
- JWT-based authentication
- Role-based access control (Admin, Manager, Technician, Client)
- Secure session management

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 18.3+ |
| **Language** | TypeScript | 5.0+ |
| **Styling** | Tailwind CSS | 3.4+ |
| **Charts** | Recharts | 2.12+ |
| **Icons** | Lucide React | 0.460+ |
| **HTTP Client** | Axios | 1.7+ |
| **Real-time** | WebSocket | - |
| **Build Tool** | Vite | 5.0+ |

</div>

---

## 📁 Project Structure

```
src/
├── 📂 components/
│   ├── 📂 chat/
│   │   ├── ChatInput.tsx          # Message input with mentions
│   │   ├── ChatMessage.tsx        # Message bubble with reactions
│   │   ├── ChatRoom.tsx           # Active conversation view
│   │   ├── ChatRoomList.tsx       # Sidebar with rooms
│   │   ├── ReactionPicker.tsx     # Emoji reaction selector
│   │   └── UserList.tsx           # Available users list
│   │
│   └── 📂 dashboard/
│       ├── DashboardContent.tsx   # Main dashboard layout
│       ├── KPICard.tsx            # KPI metric cards
│       ├── SalesChart.tsx         # Interactive sales chart
│       ├── TopProducts.tsx        # Best products list
│       ├── RegionalMap.tsx        # Regional performance
│       └── AlertsList.tsx         # Recent notifications
│
├── 📂 contexts/
│   ├── AuthContext.tsx            # Authentication state
│   └── NotificationContext.tsx    # Notification management
│
├── 📂 hooks/
│   ├── useAuth.ts                 # Auth hook
│   └── useChatWebSocket.ts        # WebSocket connection
│
├── 📂 pages/
│   ├── Dashboard.tsx              # Analytics page
│   ├── ChatPage.tsx               # Messaging page
│   └── Login.tsx                  # Authentication page
│
├── 📂 services/
│   ├── api.ts                     # Axios configuration
│   ├── authService.ts             # Auth API calls
│   ├── chatService.ts             # Chat API calls
│   └── dashboardService.ts        # Dashboard API calls
│
├── 📂 types/
│   └── *.ts                       # TypeScript definitions
│
└── 📂 utils/
    └── helpers.ts                 # Utility functions
```

---

## 🎨 Color Palette

<div align="center">

| Role | Color | Hex Code | Usage |
|------|-------|----------|-------|
| **Primary** | 🟦 Blue | `#1A3C5E` | Headers, buttons, main elements |
| **Accent** | 🟨 Yellow | `#FFC107` | CTAs, highlights, important |
| **Success** | 🟩 Green | `#28A745` | Positive indicators |
| **Danger** | 🟥 Red | `#DC3545` | Errors, deletions |
| **Info** | 🩵 Cyan | `#17A2B8` | Informational elements |
| **Gray** | ⚪ Gray | `#6C757D` | Secondary text, borders |

</div>

```typescript
// Color constants used throughout the app
const COLORS = {
    primary: '#1A3C5E',
    accent: '#FFC107',
    success: '#28A745',
    danger: '#DC3545',
    info: '#17A2B8',
    gray: '#6C757D',
    white: '#FFFFFF',
    background: '#F5F7FA'
};
```

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+ or 20+
npm 9+ or yarn 1.22+
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/nassaigael/henri-fraise-frontend.git

# 2. Navigate to project
cd henri-fraise-frontend

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env

# 5. Start development server
npm run dev
```

### Environment Variables

```env
# Required
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws

# Optional
VITE_APP_NAME=Henri Fraise
VITE_APP_VERSION=1.0.0
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start development server |
| `npm run build` | 📦 Build for production |
| `npm run preview` | 👁️ Preview production build |
| `npm run lint` | 🔍 Run ESLint |
| `npm run type-check` | ✅ Run TypeScript compiler |

---

## 📡 API Integration

### Base Configuration

```typescript
// API base URL
const API_BASE = '/api/v1';

// WebSocket URL
const WS_URL = '/ws';
```

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | Dashboard analytics |
| `/dashboard/export/excel` | GET | Excel report export |
| `/dashboard/sales-by-day` | GET | Daily sales data |
| `/dashboard/sales-by-month` | GET | Monthly sales data |
| `/dashboard/top-products` | GET | Best products |
| `/chat/rooms` | GET | User chat rooms |
| `/chat/messages` | GET | Chat messages |
| `/auth/login` | POST | Authentication |
| `/auth/me` | GET | Current user |

---

## 👨‍💻 Developer

<div align="center">
  
### Gaël RAMAHANDRISOA
  
*Full Stack Developer & Data Analyst*

[![GitHub](https://img.shields.io/badge/GitHub-nassaigael-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nassaigael)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Gaël_RAMAHANDRISOA-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/gael-ramahandrisoa)
[![Email](https://img.shields.io/badge/Email-gael@henrifraise.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:gael@henrifraise.com)

</div>

---

## 📄 License

```
© 2026 Henri Fraise. All Rights Reserved.

This software is proprietary and confidential.
Unauthorized copying, distribution, or use of this software is strictly prohibited.
```

---

<div align="center">
  
**Built with ❤️ for Henri Fraise**

*Empowering agriculture through technology*

</div>