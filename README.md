# Resumix - The Premium ATS-Optimized Resume Builder Free

Welcome to **Resumix**, an open-source, developer-focused, single-column ATS (Applicant Tracking System) Resume Builder. Resumix is designed to help software engineers, developers, and tech professionals generate clean, structured, and high-scoring resumes that easily pass automated recruiter filters while offering a visually stunning SaaS experience.

![Resumix Banner](https://via.placeholder.com/1200x400?text=Resumix+-+ATS+Resume+Builder) *(Add your banner here)*

---

## 📑 Table of Contents

- [Why Resumix?](#-why-resumix)
- [Core Features](#-core-features)
- [User & Admin Flow](#-user--admin-flow)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started (Local Setup)](#-getting-started-local-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Why Resumix?

Most resume builders either generate bloated, multi-column PDFs that ATS systems cannot parse, or they charge exorbitant fees. Resumix solves both problems by providing **5 zero-bloat, single-column templates** optimized specifically for database parsing, completely for free. 

It also includes an **ATS Scorer Engine** that analyzes keyword density, section headers, formatting structure, and developer best practices in real-time.

---

## ✨ Core Features

- **Passwordless OTP Authentication**: Frictionless user onboarding. Users sign up and log in using only their email address and a secure 6-digit OTP code delivered via email.
- **Nodemailer SMTP Integration**: Production-ready email delivery system using Nodemailer, with an auto-fallback to console logging during local development to prevent crashes if SMTP is unconfigured.
- **Stealth Admin Login**: A highly secure, hidden admin login system. By typing a configurable secret code (e.g., `resumixadmin123`) into the standard email field, the UI seamlessly transitions to an admin login portal, completely hiding the admin identity from general view.
- **Premium Dark SaaS Redesign**: A sleek, modern user interface built with Tailwind CSS, featuring glowing borders, micro-animations, and responsive elements.
- **Vibrant Floating Visuals**: The hero section includes floating resume visual cards and slow-bounce overlay indicators (ATS Optimization score widget, live suggestions audit).
- **Centralized Mock Data**: Easy customization of template previews using `mockData.js`, dynamically injecting professional details for seamless UI testing.
- **5 Pre-Validated ATS Formats**: Choose from Minimalist, Classic, Tech Standard, Modern Developer, or Compact Professional templates. All designed for maximum ATS compatibility.
- **Rate Limiting**: Built-in API rate limiting (`express-rate-limit`) to protect the backend from brute-force and DDoS attacks.

---

## 🛡️ User & Admin Flow

### Regular Users
1. User visits the landing page and clicks **Login/Register**.
2. Enters their **Email Address** (No password required).
3. A 6-digit OTP is sent to their email via SMTP.
4. User enters the OTP and is authenticated into the builder dashboard.

### Admin Users
1. Admin visits the standard **Login/Register** page.
2. Instead of their email, the admin types the **Secret Code** (defined in `.env`) into the email field.
3. The system detects the secret code (via debounced API check), automatically swaps the email field to the Admin's configured email, and reveals a **Password** field.
4. Admin enters their password and gains access to the administrative dashboard.

---

## 🛠️ Tech Stack

This project utilizes a modern, split client-server architecture.

### Frontend (`frontend/`)
- **Framework**: Vite + React (SPA)
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Forms & State**: React Hook Form, Context API
- **PDF Generation**: `html2pdf.js` (Client-side rendering)

### Backend (`backend/`)
- **Server**: Node.js & Express
- **Database**: MongoDB with Mongoose (ODM)
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS
- **Email Delivery**: Nodemailer (SMTP)
- **Security**: Express Rate Limit, CORS

---

## 📂 Folder Structure

```text
resumix/
├── backend/                  # Node.js + Express API Server
│   ├── src/
│   │   ├── config/           # MongoDB connection & Admin database seeding
│   │   ├── controllers/      # Business logic (OTP, secret check, CRUD ops)
│   │   ├── middleware/       # JWT auth & error handling middleware
│   │   ├── models/           # Mongoose schemas (User, Resume)
│   │   ├── routes/           # Express API endpoints
│   │   └── utils/            # Nodemailer SMTP setup and utilities
│   ├── .env.example          # Template for environment variables
│   └── server.js             # Entry point for backend
│
├── frontend/                 # Vite + React Client
│   ├── src/
│   │   ├── components/       # Reusable UI widgets (Navbar, Footer, Cards)
│   │   ├── context/          # React Context (AuthContext for Passwordless Flow)
│   │   ├── pages/            # Page views (Home, Login, Dashboard, Templates)
│   │   ├── services/         # Axios API service integrations
│   │   ├── templates/        # 5 ATS-compliant Resume Layouts
│   │   ├── utils/            # ATS scorer logic, mock data
│   │   ├── App.jsx           # App routing
│   │   └── index.css         # Global styles & Tailwind directives
│   └── package.json          # Frontend dependencies
│
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started (Local Setup)

Ensure you have **[Node.js](https://nodejs.org)** (v16+) and **[MongoDB](https://www.mongodb.com)** installed and running on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/resumix.git
cd resumix
```

### 2. Backend Setup
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Copy the environment template and configure your secrets:
   ```bash
   cp .env.example .env
   ```
   *(See the [Environment Variables](#-environment-variables) section below for configuration details).*
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal, navigate to the frontend directory, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will run on `http://localhost:5173`. Open this URL in your browser.*

---

## ⚙️ Environment Variables

Configure the `backend/.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/resumix

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_key_here

# Admin Portal Configuration
# Typing ADMIN_SECRET_CODE in the login email field triggers the admin password prompt
ADMIN_EMAIL=rd@resumix.com
ADMIN_SECRET_CODE=resumixadmin123
ADMIN_PASSWORD=iloveCoding01#

# SMTP Email Configuration (Nodemailer)
# Used for sending OTPs to users. If left blank, OTPs will print to the backend console.
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="Resumix" <your-email@gmail.com>
```

---

## 📡 API Reference

Here are the primary authentication endpoints powering Resumix:

- **`POST /api/auth/register`**: Register a new user and trigger an OTP email.
- **`POST /api/auth/login`**: Initiate login for an existing user and trigger an OTP email.
- **`POST /api/auth/verify-otp`**: Verify the 6-digit OTP and return a JWT token.
- **`POST /api/auth/check-secret-code`**: Validates the admin secret code typed into the frontend.
- **`POST /api/auth/admin-login`**: Authenticates the admin using email and password.

---

## 🤝 Contributing

Resumix is open-source and we welcome contributions! Whether it's adding new ATS templates, improving the scoring algorithm, or fixing bugs:

1. **Fork** the repository.
2. **Create a branch** for your feature (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

Please ensure your code follows the existing style, and test the frontend and backend locally before submitting.

---

## 👨‍💻 Developer

**Rajat Debnath**
- Email: [rahuldebnat40@gmail.com](mailto:rahuldebnat40@gmail.com)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ for developers by Rajat Debnath & the Resumix Open Source Community.*
