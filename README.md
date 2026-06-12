# Resumix: ATS-Friendly Resume Builder

Resumix is a premium, production-grade MERN-stack web application designed for Computer Science, IT students, and developer graduates to draft, optimize, and export recruiter-friendly, ATS-compliant resumes.

## 🚀 Key Features

* **5 High-Convert ATS Templates**: Custom single-column layouts styled purely with text fields (no icons, charts, or images) to ensure 100% parsing accuracy by Applicant Tracking Systems.
  * *Classic Professional*
  * *Software Engineer ATS*
  * *Fresh Graduate ATS*
  * *Modern Minimal ATS*
  * *IT Professional ATS*
* **Dynamic ATS Scoring Engine**: Instant, real-time checklist evaluation scoring resumes from `0-100` based on:
  * Profile completeness (contact details, summary, declaration, etc.)
  * Technical skill density (languages, frameworks, tools)
  * Experience/projects depth
  * Content length recommendations
* **Interactive Drag & Drop Section Reorder**: Drag-and-drop or click-button sorting panel that rearranges resume sections (e.g. placing Education above Projects or vice versa) dynamically updating both preview cards and print page flows.
* **Direct client-side PDF Export**: Seamless download powered by `html2pdf.js` executing background rendering to A4 layouts. Avoids browser print dialogs, strips out preview shadows/borders, and uses CSS page-break optimization to prevent text splitting vertically across pages.
* **AI-styled Smart Suggestions & Presets**: Apply pre-built professional summaries and skill matrices tailored for specific developer profiles:
  * *MERN Stack Developer*
  * *Java Backend Developer*
  * *Python/Django Developer*
* **Analytical Dashboards**:
  * **User Dashboard**: Save/edit drafts, rename documents, and view real-time ATS scores and document download counts.
  * **Admin Panel**: Track platform statistics (total users, total resumes, average ATS score, template popularity graphs) and manage user records.
* **Premium Glassmorphic Alerts**: Integration of custom colored alerts and action notifications using `react-hot-toast`.

---

## 🛠 Tech Stack

* **Frontend**: React.js (Vite), React Router (v6), Tailwind CSS, React Hook Form, Axios, Lucide Icons, `html2pdf.js`
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Auth**: JSON Web Tokens (JWT), bcryptjs password encryption, and middleware-protected endpoints.

---

## 📁 Directory Structure

```
├── backend/
│   ├── package.json
│   ├── server.js               # Express entry point & middleware hooks
│   └── src/
│       ├── config/             # DB Connection (db.js)
│       ├── models/             # User.js, Resume.js, Template.js
│       ├── middleware/         # Auth, Error handlers
│       ├── controllers/        # Auth, Resume, and Admin controllers
│       └── routes/             # API Endpoints mapping
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx             # Router, Route Guards, Toaster setup
        ├── index.css           # Scrollbar and custom A4 print styling
        ├── components/         # Navbar, Footer
        ├── context/            # AuthContext (JWT session management)
        ├── templates/          # ResumeTemplates rendering engine
        ├── utils/              # ATS scoring and keyword lists
        └── pages/              # Landing, Auth, Dashboards, Builder, Preview
```

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /register` - Register new account.
* `POST /login` - Login user (returns JWT token in response).
* `GET /profile` - Fetch authenticated user profile.
* `POST /forgot-password` - Request a password reset link.
* `POST /reset-password` - Reset account password.

### 📄 Resumes (`/api/resumes`)
* `POST /` - Save a new resume.
* `GET /` - List all resumes owned by the active user.
* `GET /:id` - Retrieve a specific resume.
* `PUT /:id` - Update an existing resume details.
* `DELETE /:id` - Remove a resume.
* `POST /:id/download` - Record a download transaction increment.

### 🛡 Admin Controls (`/api/admin`)
* `GET /stats` - Retrieve high-level metrics & template analytics.
* `GET /users` - List all registered user records.
* `GET /resumes` - List all resumes on the platform.
* `DELETE /users/:id` - Delete user account & their resumes.

---

## ⚙ Run & Installation Guide

### Prerequisites
* Node.js (v18+)
* MongoDB running locally or a MongoDB Atlas Database URI.

### 1. Backend Setup
1. Open the backend folder and create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_signing_token
   NODE_ENV=development
   ```
2. Install dependencies and start:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

### 2. Frontend Setup
1. Open the frontend folder and configure variables:
   Create a `.env` in `frontend/`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
2. Install dependencies (using legacy peer flags due to React 19 libraries) and start:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```

3. Open `http://localhost:5173` to test the application.
