<div align="center">

# 🌾 RuralPay

### Buy Now Pay Later · Rural Fintech Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ruralpay-app.vercel.app/)

**RuralPay** is a full-stack BNPL (Buy Now Pay Later) platform designed to bring accessible digital financing to rural communities. Users can apply for installment-based loans on durable goods, manage their digital wallet, track expenses, set budgets, and more — all in a premium glassmorphism UI.

[🚀 Live Demo](https://ruralpay-app.vercel.app/) · [📂 Repository](https://github.com/AmnaArshadk5/web-pro)

</div>

---

## 📸 Project Overview

| Role | Dashboard |
|------|-----------|
| 👤 **User** | Wallet, Transactions, Expenses, Budgets, Reports, Marketplace, BNPL Financing |
| 🏪 **Retailer** | Command Center, Manage Inventory, Sales Activity, Business Profile |
| 🛡️ **Admin** | Platform Analytics, User Management, Wallet Overview, Fraud Monitoring, Loan Approvals |

---

## ✨ Features

### 🔐 1. Authentication & Authorization
- Secure **Registration** and **Login** with form validation.
- Passwords protected with **bcrypt** hashing (salt rounds: 10).
- Stateless session management via **JWT (JSON Web Tokens)**.
- **Role-based access control** with three distinct roles: `user`, `retailer`, `admin`.
- Auto-provisioned **empty wallet** created for every new user on registration.
- Blocked users are denied login with a descriptive error message.

---

### 💳 2. Digital Wallet & Transactions
- **Deposits** — Add funds securely to your wallet balance.
- **Withdrawals** — Remove funds with balance validation (prevents overdraft).
- **Transfers** — Send money to any active user via email address.
- **Transaction History** — Full ledger with statuses: `successful`, `pending`, `flagged`, `failed`.
- **ACID Compliance** — Atomic balance operations ensure funds are never lost during transfers.
- **Downloadable Receipts** — Export individual transaction records as PDF.

---

### 📊 3. Expenses & Budget Management
- **Expense Tracker** — Log daily expenses with categories (Agriculture, Home Appliances, Healthcare, Education, etc.).
- **Monthly Budgets** — Set per-category spending limits for each calendar month.
- **Smart Status Engine** — Automatically calculates spending health:
  - 🟢 `Safe` — Under 80% of the limit
  - 🟡 `Near Limit` — Between 80–100% of the limit
  - 🔴 `Exceeded` — Over the budget limit
- **Expense Reports** — Visual breakdowns via Chart.js with category-wise and time-series analysis.

---

### 🛒 4. Marketplace & BNPL Financing
- **Product Marketplace** — Browse durable goods (Solar Pumps, Tractors, Irrigation Systems, etc.) with search and category filters.
- **Apply for Financing** — Users can select any product and submit a BNPL loan application.
- **Installment Tracker** — View active loan schedules, repayment timelines, and remaining balance.
- **Retailer Listings** — Retailers can list, edit, and delete only their own products.

---

### 🛡️ 5. Admin Panel & Fraud Monitoring
- **Admin Dashboard** — Platform-wide KPIs: Total Volume, Active Users, Blocked Accounts, Flagged Transactions.
- **User Management** — Block or unblock any user account instantly.
- **Wallet Overview** — View all user balances across the platform.
- **Transaction Monitor** — Inspect and search all platform transactions.
- **Financing Review** — Approve or reject pending BNPL loan applications.
- **Category Management** — Add, edit, or remove product categories.
- **System Reports** — Revenue analytics and usage trends.

#### 🚨 Automated Fraud Detection Rules
Transactions are **automatically flagged** if any of the following conditions are met:

| # | Rule | Threshold |
|---|------|-----------|
| 1 | Single Transfer | > **100,000 PKR** |
| 2 | Single Deposit | > **200,000 PKR** |
| 3 | Rapid Transfers | More than **5 transfers** within **10 minutes** |
| 4 | Failed Withdrawals | More than **3 failed attempts** within **24 hours** |
| 5 | New User High-Value | Transaction > **50,000 PKR** by an account **< 24 hours old** |

---

### 🏪 6. Retailer Portal
- Separate **Retailer Dashboard** with business analytics (Active Listings, Total Sales Volume, BNPL Pipeline).
- Retailers register with a dedicated role — completely separate UI and navigation from regular users.
- **Ownership-Based Permissions** — Retailers can only edit/delete products they personally listed; admin can manage all.

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18, Vite, React Router v6, Axios |
| **Styling** | Vanilla CSS, Glassmorphism Design System, Framer Motion |
| **Charts** | Chart.js via `react-chartjs-2` |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Auth** | JSON Web Tokens (JWT), bcrypt |
| **Security** | CORS, Helmet, Rate Limiting |
| **Deployment** | Vercel (Frontend + Serverless Backend) |

---

## 📁 Project Structure

```
ruralpay/
├── frontend/                  # React.js Vite App
│   ├── public/
│   │   ├── wheat_logo.png     # App logo
│   │   ├── hero.png           # Hero section image
│   │   └── wallet3d.png       # 3D wallet visual
│   └── src/
│       ├── components/        # Layout, ProtectedRoute, FloatingCrops
│       ├── context/           # AuthContext (global auth state)
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # All page components
│       │   ├── Landing.jsx
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Wallet.jsx / Transactions.jsx
│       │   ├── Expenses.jsx / Budgets.jsx / Reports.jsx
│       │   ├── Marketplace.jsx / Financing.jsx
│       │   ├── RetailerDashboard.jsx
│       │   └── Admin*.jsx     # 8 Admin panel pages
│       ├── routes/            # AppRoutes.jsx, ProtectedRoute.jsx
│       ├── services/          # Axios API service modules
│       └── styles/            # Global CSS tokens
│
├── backend/                   # Node.js / Express API
│   └── src/
│       ├── config/            # DB connection
│       ├── controllers/       # Business logic handlers
│       ├── middlewares/       # Auth, role, error handlers
│       ├── models/            # Mongoose schemas
│       │   ├── User.js
│       │   ├── Wallet.js
│       │   ├── Transaction.js
│       │   ├── Product.js
│       │   └── FinancingApplication.js
│       ├── routes/            # Express route definitions
│       ├── utils/             # Token generation, helpers
│       └── validations/       # Input validation schemas
│
├── vercel.json                # Vercel monorepo deployment config
└── README.md
```

---

## 🛠️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`
- (Optional) [MongoDB Compass](https://www.mongodb.com/products/compass) for visual DB management

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/AmnaArshadk5/web-pro.git
cd web-pro/projectwebcourse
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ruralpay
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

> ✅ Backend runs on **`http://localhost:5000`**

---

### Step 3 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

> ✅ Frontend runs on **`http://localhost:5173`**

---

### Step 4 — Seed Initial Data (Optional)

To populate the database with sample products and an admin user:

```bash
cd backend
node src/seedAdmin.js      # Creates default admin account
node src/seedProducts.js   # Populates the marketplace
```

> Default admin credentials will be printed in the terminal after seeding.

---

## 👑 Accessing the Admin Panel

> By default, all newly registered users are assigned the `user` role.

**To manually promote a user to Admin for testing:**

1. Register a new account on the frontend.
2. Open **MongoDB Compass** and connect to: `mongodb://localhost:27017`
3. Navigate to: `ruralpay` database → `users` collection.
4. Find your user document, click **Edit**.
5. Change the `"role"` field from `"user"` → `"admin"`.
6. Click **Update** to save.
7. Return to the app, log out, and log back in — the Admin Dashboard is now accessible.

**To access the Retailer Dashboard:**
- Simply register a new account and select **"Retailer"** on the registration page.

---

## ☁️ Deployment

The application is deployed as a monorepo on **Vercel** with the backend running as serverless functions.

### Live URLs
| Service | URL |
|---------|-----|
| 🌐 Production App | [https://ruralpay-app.vercel.app](https://ruralpay-app.vercel.app) |

---

### Deploy Your Own Fork

#### Frontend + Backend on Vercel (Recommended)

1. Push your fork to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repository.
3. Vercel will auto-detect the `vercel.json` configuration.
4. Add the following **Environment Variables** in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `NODE_ENV` | `production` |

5. Click **Deploy**.

---

#### Backend on Render (Alternative)

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the same Environment Variables as above.
5. After deploy, copy the backend URL and update `VITE_API_URL` in your frontend environment.

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ruralpay
JWT_SECRET=change_this_to_a_long_random_secret
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |
| `PUT` | `/api/auth/profile` | Update profile |
| `PUT` | `/api/auth/change-password` | Change password |

### Wallet & Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/wallet` | Get wallet balance |
| `POST` | `/api/wallet/deposit` | Deposit funds |
| `POST` | `/api/wallet/withdraw` | Withdraw funds |
| `POST` | `/api/wallet/transfer` | Transfer to another user |
| `GET` | `/api/transactions` | Get transaction history |

### Marketplace & Financing
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products |
| `POST` | `/api/products` | Create product (retailer/admin) |
| `PUT` | `/api/products/:id` | Update product (owner/admin) |
| `DELETE` | `/api/products/:id` | Delete product (owner/admin) |
| `GET` | `/api/financing` | Get financing applications |
| `POST` | `/api/financing` | Submit BNPL application |

### Admin (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | List all users |
| `PUT` | `/api/admin/users/:id/block` | Block/unblock user |
| `GET` | `/api/admin/stats` | Platform analytics |
| `GET` | `/api/admin/flagged` | Flagged transactions |

---

## 🔒 Security Architecture

```
Request → CORS Check → Rate Limiter → Auth Middleware (JWT verify)
       → Role Check → Controller → Fraud Detection Engine → DB
```

- All sensitive routes require a valid JWT in the `Authorization: Bearer <token>` header.
- Admin-only routes additionally verify `user.role === 'admin'`.
- Retailer product mutations verify `product.retailerId === user._id`.
- Passwords are **never stored in plain text** — only bcrypt hashes.

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request.

---

## 📄 License

This project is submitted as an academic project for university coursework. All rights reserved by the project team.

---

<div align="center">

**Built with ❤️ for Rural Communities**

[🌐 Live Demo](https://ruralpay-app.vercel.app/) · [⬆️ Back to Top](#-ruralpay)

</div>
