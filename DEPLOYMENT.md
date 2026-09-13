# 🚀 CivicFix Production Deployment Guide

This guide provides step-by-step instructions to deploy **CivicFix** to production cloud platforms (such as Render, Railway, Supabase, Vercel, and Cloudinary).

---

## 🏗️ 1. Production Architecture Overview

```text
┌─────────────────────────────────────────────────────────┐
│              User Web Browser (HTTPS)                    │
└───────────────────────────┬─────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│ React 18 + Vite       │       │ Node.js / Express     │
│ Frontend (Vercel)     │ ───►  │ Backend (Render)      │
└───────────────────────┘       └───────────┬───────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
        ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
        │ Cloudinary Cloud     ││ Prisma ORM           ││ PostgreSQL Database  │
        │ Persistent Media     ││ Data Layer           ││ (Supabase / Neon)    │
        └──────────────────────┘└──────────────────────┘└──────────────────────┘
```

* **Frontend**: React 18 + Vite single-page web app deployed to **Vercel / Netlify**.
* **Backend**: Express.js REST API deployed to **Render / Railway / Fly.io**.
* **Database**: PostgreSQL database hosted on **Supabase / Neon / Railway**.
* **ORM**: Prisma ORM with connection pooling and SSL support (`sslmode=require`).
* **Media Storage**: Persistent cloud storage via **Cloudinary API** (with local disk fallback).
* **Security**: CORS origin restrictions, bcrypt password hashing, JWT stateless authentication over HTTPS.

---

## 🛠️ 2. Required Accounts & Cloud Services

| Service | Purpose | Free Tier Available? |
| :--- | :--- | :--- |
| **Vercel / Netlify** | Frontend Web Hosting (Vite SPA) | ✅ Yes |
| **Render / Railway** | Express API Server Hosting | ✅ Yes |
| **Supabase / Neon** | Managed PostgreSQL Database | ✅ Yes |
| **Cloudinary** | Persistent Image/Photo Cloud Storage | ✅ Yes |

---

## 🔑 3. Production Environment Variables

### Backend (`backend/.env`)
Set these environment variables in your backend hosting platform (e.g. Render Environment Variables):

```env
# 1. Database Connection (PostgreSQL with SSL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/civicfix?schema=public&sslmode=require"

# 2. JWT Authentication Secret (Use a strong 64-char random string)
JWT_SECRET="e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8"

# 3. Server Port
PORT=5000

# 4. Community Vote Escalation Threshold
VOTE_THRESHOLD=10

# 5. Deployed Frontend Web URL (For CORS authorization)
FRONTEND_URL="https://civicfix.vercel.app"

# 6. Persistent Cloud Media Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Frontend (`frontend/.env`)
Set this variable when building the frontend in Vercel:

```env
# Production Backend API URL
VITE_API_URL="https://civicfix-backend.onrender.com/api"
```

---

## 🗄️ 4. PostgreSQL Database & Prisma Setup

1. **Provision PostgreSQL Database**:
   - Create a new PostgreSQL database instance on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
   - Copy the direct connection string with `sslmode=require`.

2. **Run Prisma Migrations**:
   In your CI/CD pipeline or local terminal connected to production DB:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

3. **Seed Production Demo Dataset**:
   To populate test accounts and Ghaziabad demonstration issues:
   ```bash
   npm run seed
   ```

---

## 📦 5. Deploying the Backend (Render / Railway)

1. **Create New Web Service**:
   - Link your GitHub repository (`Shalu004/CivicFix`).
   - Set **Root Directory** to `backend`.
   - Set **Build Command**: `npm install && npx prisma generate`
   - Set **Start Command**: `npm start`
2. **Add Environment Variables**:
   - Paste all backend variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `CLOUDINARY_*`).
3. **Deploy Service**:
   - Copy your backend live URL (e.g. `https://civicfix-backend.onrender.com`).

---

## 💻 6. Deploying the Frontend (Vercel / Netlify)

1. **Create New Project**:
   - Import GitHub repository (`Shalu004/CivicFix`).
   - Set **Root Directory** to `frontend`.
   - Set **Framework Preset**: `Vite`.
   - Set **Build Command**: `npm run build`
   - Set **Output Directory**: `dist`
2. **Add Environment Variables**:
   - Add `VITE_API_URL=https://civicfix-backend.onrender.com/api`.
3. **Verify SPA Routing**:
   - `vercel.json` and `public/_redirects` are pre-configured to ensure single-page app deep links (`/issues/:id`, `/admin`, `/dashboard`) reload cleanly without 404 errors.

---

## 🔒 7. Security, CORS & HTTPS Verification

- **HTTPS Requirement**: Modern browser Geolocation (`navigator.geolocation`) requires an HTTPS origin in production. Deploying on Vercel and Render automatically provides valid SSL certificates.
- **CORS Safeguard**: The Express backend dynamically checks `process.env.FRONTEND_URL` and rejects unauthorized cross-origin requests.
- **Secret Isolation**: All credentials, tokens, and DB passwords are split into `.env` files which are excluded from Git repository history.

---

## 🔑 8. Production Demo Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@civicfix.local` | `Admin@12345` | Status Management, Authenticity Control, Rejection Reason Enforcement, Civic Analytics |
| **Citizen User** | `citizen@civicfix.local` | `Citizen@12345` | Issue Reporting, Leaflet GPS Pinning, Photo Uploads, Community Upvoting |

---

## ⚠️ 9. Known Operational Limitations

1. **Local Disk Storage in Ephemeral Containers**: If Cloudinary credentials are omitted in production, Multer defaults to disk storage at `backend/uploads/`. Note that container hosts like Render/Heroku have ephemeral filesystems which reset uploaded files upon instance restart. Configured Cloudinary credentials are recommended for permanent media storage.
2. **Browser Geolocation Permissions**: Browser GPS requires explicit user permission. If a citizen denies location access, they can click the interactive Leaflet map to drop an exact GPS pin manually.
