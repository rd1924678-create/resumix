# Resumix - Developer-Focused ATS Resume Builder

Resumix is a premium, developer-focused, single-column ATS (Applicant Tracking System) Resume Builder. It helps software engineers, developers, and tech professionals generate clean, structured, and high-scoring ATS-compliant resumes that easily pass automated recruiter filters.

This repository uses a clean **split client-server architecture** consisting of:
1. **Frontend**: Vite + React SPA styled with Tailwind CSS v3.
2. **Backend**: Express + Node.js REST API server utilizing MongoDB/Mongoose.

---

## ✨ Features

- **Passwordless OTP Auth System**: Regular users sign up and sign in using only their email and a secure 6-digit OTP code (One-Time Password) delivered to their inbox.
- **Nodemailer Email Integration**: Integrates directly with SMTP servers (like Gmail) to send OTP codes in professional HTML templates, with an auto-fallback to console logging during local development if credentials aren't set.
- **Secret Code Admin Login**: An admin login system. Typing a configurable secret code (e.g. `resumixadmin123`) debounces the input, swaps the email field to the admin email, and prompts for the admin password, completely hiding the admin identity from general view.
- **Centralized Mock Data**: Mock data is centralized in [mockData.json](file:///frontend/src/utils/mockData.json). All templates and UI previews load detailed professional details dynamically from this JSON, using `"Your Name"` and `"your.email@gmail.com"` as placeholders.
- **Premium Dark SaaS Redesign**: Sleek modern user interface with responsive elements, glowing borders, and micro-animations.
- **Vibrant Floating Visuals**: Floating resume visual cards and slow-bounce overlay indicators (ATS Optimization score widget, live suggestions audit) in the hero section.
- **ATS Scorer Engine**: Real-time analyzer scoring your resume based on keyword density, section headers, formatting structure, and developer best practices.
- **5 Pre-Validated ATS Formats**: Zero-bloat, single-column text templates (Minimalist, Classic, Tech Standard, Modern Developer, Compact Professional) designed specifically for database parses.

---

## 🛠️ Tech Stack

### Frontend (`frontend/`)
- **SPA Builder**: Vite + React
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form
- **PDF Generation**: `html2pdf.js` (rendered client-side)

### Backend (`backend/`)
- **API Server**: Node.js & Express
- **Email Delivery**: Nodemailer (SMTP)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & BcryptJS

---

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com) installed.

### 1. Backend Setup

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` directory and configure the variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/resumix
   JWT_SECRET=supersecretjwtkeyforresumixapp
   NODE_ENV=development

   # Admin Configuration
   ADMIN_EMAIL=rd@resumix.com
   ADMIN_SECRET_CODE=resumixadmin123

   # Email Configuration (SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM="Resumix" <your-email@gmail.com>
   ```
3. Run the backend development server:
   ```bash
   npm run dev
   ```
   The API server runs on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Run the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend SPA runs on `http://localhost:5173`. Open it in your web browser!

---

## 📂 Repository Architecture

```
├── backend/              # Node.js + Express Server
│   ├── src/
│   │   ├── config/       # Mongoose DB connection & Admin seeding logic
│   │   ├── controllers/  # API business logic (OTP verification, secret check, CRUD)
│   │   ├── middleware/   # Authentication tokens & error controllers
│   │   Model/           # Mongoose schemas (User, Resume)
│   │   ├── routes/       # Express route mappings
│   │   └── utils/        # SMTP sendEmail (nodemailer) wrapper
│   ├── .env              # Secrets and configs (ignored)
│   └── server.js         # Entry point
│
├── frontend/             # Vite + React Client SPA
│   ├── src/
│   │   ├── components/   # Modular UI widgets (Navbar, Footer, etc.)
│   │   ├── context/      # AuthContext providers (Register, Login, verifyOtp)
│   │   ├── pages/        # Router page views (Redesigned SaaS Hero, Split Auth)
│   │   ├── services/     # Axios client service integrations (checkSecretCode, verifyOtp)
│   │   ├── templates/    # Single-column ATS resume layouts
│   │   ├── utils/        # ATS scorer algorithms & mockData.json
│   │   └── index.css     # Dark theme layout variables, scrollbars & keyframes
│   └── package.json      # Dependencies
│
└── .gitignore            # Root git ignores
```
