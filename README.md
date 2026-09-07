# CivicFix — Full-Stack Civic Issue Reporting Platform

CivicFix is a complete, production-grade MVP web application designed for citizens to report local civic problems—such as potholes, sewage leaks, garbage accumulation, electricity faults, water supply issues, and broken streetlights—and for municipal authorities to verify reports, update resolution progress, and monitor city-wide analytics.

---

## 🚀 Features

### 🏢 Citizen Features
* **Fast Issue Reporting**: Submit a detailed report with photo evidence, category classification, address, and optional GPS location in under 60 seconds.
* **Interactive Issue Feed**: Search, filter by category/status/area, and sort by Most Recent or Most Voted.
* **Upvoting System**: Toggle upvotes to signal urgent community priorities. Issues meeting the configured threshold (`VOTE_THRESHOLD=10`) are automatically escalated to municipal attention.
* **Citizen Dashboard**: Track personal submissions, active issues, resolved reports, and upvoted community issues.
* **Resolution History Timeline**: View audit logs of status transitions and authority progress notes.

### 🛡️ Admin Features
* **Secure Admin Authentication**: Dedicated admin portal (`/admin`) requiring an existing `ADMIN` role.
* **Issue Management**: Filter reports by status, category, min upvotes, or search terms.
* **Status & Authenticity Control**: Update report progression (`Pending` → `Verified` → `In Progress` → `Resolved` or `Rejected`) and flag report authenticity (`Verified`, `Unverified`, `Spam`). Rejections require a clear justification note.
* **Civic Analytics**: Visual dashboard providing real-time breakdowns by category, status, top affected areas, vote distribution, and overall resolution rate.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React 18, Vite
* **Styling**: Tailwind CSS, PostCSS, Google Fonts (Inter)
* **Icons**: Lucide React
* **Routing**: React Router DOM (v6)
* **HTTP Client**: Axios with centralized interceptors
* **Maps**: Leaflet & OpenStreetMap (interactive location picker)

### Backend
* **Runtime & Framework**: Node.js, Express.js
* **Database & ORM**: PostgreSQL, Prisma ORM
* **Authentication**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`)
* **File Uploads**: Multer (isolated local storage at `backend/uploads/`)
* **Security & Tools**: CORS, Dotenv

---

## 📁 Folder Structure

```text
civicfix/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── issueController.js
│   │   │   └── adminController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── issueRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── adminGuard.js
│   │   │   └── upload.js
│   │   ├── utils/
│   │   │   ├── prisma.js
│   │   │   └── jwt.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── uploads/
│   │   └── .gitkeep
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── IssueCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── CategoryIcon.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ReportIssue.jsx
│   │   │   ├── IssueDetail.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
* **Node.js**: v18.x or higher
* **npm**: v9.x or higher
* **PostgreSQL**: Running instance listening on port `5432`
* **Git**

### 2. PostgreSQL Setup
Create a PostgreSQL database named `civicfix`:
```sql
CREATE DATABASE civicfix;
```

### 3. Backend Setup
Navigate to the `backend` directory, install dependencies, configure environment variables, run Prisma migrations, and seed sample data:

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Run Prisma migrations & generate client
npx prisma migrate dev --name init

# Seed database with demo accounts and sample civic issues
npm run seed

# Start backend server
npm run dev
```
> Backend running at: **`http://localhost:5000`**

### 4. Frontend Setup
In a second terminal, navigate to the `frontend` directory, install dependencies, and start Vite dev server:

```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```
> Frontend running at: **`http://localhost:5173`**

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@civicfix.local` | `Admin@12345` | Full Admin Panel & Status Management |
| **Citizen** | `citizen@civicfix.local` | `Citizen@12345` | Issue Reporting & Upvoting |

---

## 📡 API Overview

### Auth Endpoints (`/api/auth`)
* `POST /api/auth/signup` — Create citizen account (always role `CITIZEN`)
* `POST /api/auth/login` — Citizen login
* `POST /api/auth/admin-login` — Admin login (requires existing `ADMIN` role)
* `GET /api/auth/me` — Retrieve current authenticated user (Protected)

### Issue Endpoints (`/api/issues`)
* `GET /api/issues` — Query issues with filters (`category`, `status`, `area`, `search`, `sort`)
* `POST /api/issues` — Create report with image upload (Protected, `multipart/form-data`)
* `GET /api/issues/:id` — Retrieve issue details and `StatusHistory` timeline
* `POST /api/issues/:id/vote` — Toggle upvote on issue (Protected; auto-escalates at `VOTE_THRESHOLD`)
* `GET /api/issues/my/dashboard` — Get logged-in citizen summary stats & reports (Protected)

### Admin Endpoints (`/api/admin`)
* `GET /api/admin/issues` — Retrieve filtered administrative issue table (Admin Guard)
* `PATCH /api/admin/issues/:id` — Update status, authenticity & progress note (Admin Guard)
* `GET /api/admin/analytics` — Retrieve system analytics (Admin Guard)

---

## 📦 GitHub Setup & Initial Commit

To push this repository to GitHub:

```bash
# From project root directory
git init
git add .
git commit -m "Initial CivicFix application release"

# Link remote repo & push
git remote add origin https://github.com/YOUR_USERNAME/civicfix.git
git branch -M main
git push -u origin main
```

---

## 🔮 Future Improvements
1. **S3 Object Storage**: Replace local `multer` storage with AWS S3 / Cloudinary using the modular upload middleware.
2. **Push / Email Notifications**: Send automated email/SMS updates to citizens when their reported issue status updates.
3. **GeoJSON Heatmaps**: Render interactive city heatmaps for density analysis of unresolved issues.
