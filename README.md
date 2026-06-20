# Resumix - The Premium ATS-Optimized Resume Builder Free

Welcome to **Resumix**, an open-source, developer-focused, single-column ATS (Applicant Tracking System) Resume Builder. Resumix is designed to help software engineers, developers, and tech professionals generate clean, structured, and high-scoring resumes that easily pass automated recruiter filters while offering a visually stunning SaaS experience.

**Live Link:** [resumixats.netlify.app](https://resumixats.netlify.app)

![Resumix Banner](./frontend/src/assets/banner.png)

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

## ✨ Core Features & Technical Explanation

This section provides a deep technical dive into Resumix's features to help developers understand the architecture and flow under the hood.

---

### 🤖 1. AI-Powered Capabilities

#### A. AI ATS Scoring & Feedback Engine
* **How it works:** When a user uploads a PDF on the ATS Scorer page or types inside the Resume Builder, the backend processes the resume text. 
* **Technical Details:** 
  1. For PDF uploads, the backend uses `unpdf` to extract raw selectable text from the memory buffer.
  2. The text is analyzed locally for baseline structural elements (presence of email, phone number, specific headers, spelling typos, and key metrics in bullets) using the local `analyzeSections` helper.
  3. The local analysis and full resume text are bundled into a prompt and dispatched to the NVIDIA NIM endpoint (`https://integrate.api.nvidia.com/v1/chat/completions`) using the **Meta Llama 3.3 70B Instruct** model.
  4. The model returns a strictly formatted JSON payload containing overall and category-specific scores (0-100), missing technical keywords, and actionable improvements.
  5. The UI dynamically highlights suggestions step-by-step relative to the user's active builder step.

#### B. AI Experience Bullets Generator
* **How it works:** Allows users to input brief, conversational descriptions of their tasks and transforms them into professional, recruiter-ready resume bullet points.
* **Technical Details:**
  - Placed inline within the projects, internships, and work experience forms in the builder.
  - Users input basic context (e.g., *"built a dashboard and fixed bugs"*).
  - The frontend sends the context, job title, and company to the backend `generateExperienceBullets` controller.
  - The LLM rewrites the bullet points, enforcing **action verbs** (e.g., *Architected*, *Optimized*), **quantifiable metrics** (e.g., *reduced load time by 30%*), and **technical depth** (e.g., *using React and Redux*).
  - Results are instantly populated into the form fields.

#### C. Interactive AI Resume Coach (Chatbot)
* **How it works:** A live conversational chat panel on `/ats-scorer` that allows users to chat directly with their resume data.
* **Technical Details:**
  - After upload, the extracted resume text is stored in state.
  - Users type custom prompts (e.g., *"How can I adapt my resume for a Senior DevOps engineer role at a finance startup?"*).
  - The request, containing the full conversation history, user query, and resume text as base context, is sent to the backend.
  - The LLM acts as an expert recruiter coaching the user in real-time, providing targeted advice without resetting their score card.

#### D. AI Role Presets Builder
* **How it works:** Instantly populates a selected template with industry-standard skills and summaries for a specific tech stack.
* **Technical Details:**
  - Users select a pre-defined role (MERN, DevOps, Python Dev, etc.) or input a custom role name.
  - The backend leverages the LLM to generate a customized, premium professional summary and categorizes developer skill matrices (languages, frameworks, DBs, and tools) matching that role.
  - The form states are instantly updated and standard inputs are re-rendered on the fly.

#### E. ATS Score Calculation Workflow
* **How it works:** Resumix calculates the ATS matching score (0-100) using a hybrid approach combining **structural local section auditing** and **semantic LLM evaluation**.
* **Detailed Pipeline:**
  1. **Text Extraction:** Raw text is extracted from the uploaded PDF using `unpdf` or read directly from the builder form fields.
  2. **Local Structural Parsing:** The text is passed through the local `analyzeSections` helper. This engine uses regular expressions to audit structural details (checking if email/phone exists, checking for summary, experience, skills, projects, and education sections, checking for outdated declaration sections, and flagging common typos or missing metrics).
  3. **AI Context Feeding:** Instead of applying hardcoded, rigid deductions on the backend, the parser compiles these structural findings into a clear, text-based **Structural Summary** (e.g., *Projects Section: FOUND, Experience/Internships: FOUND, Spelling Error: DETECTED*).
  4. **Semantic LLM Evaluation:** This structural summary is injected into the LLM prompt alongside the raw resume text and sent to **Meta Llama 3.3 70B Instruct** via the NVIDIA NIM API.
  5. **Flexible Scoring:** The LLM reads the complete context and **freely evaluates** the final scores based on the prompt's instructions. This allows the AI to score the resume dynamically and intuitively, like a real recruiter, yielding matching scores (0-100) for the following categories:
     - **Impact (0-100)**: Technical depth, action verbs, and quantifiable metrics.
     - **Brevity (0-100)**: Clean, concise writing without filler content.
     - **Style (0-100)**: Professional headers and compliance layout formatting.
     - **Sections (0-100)**: Structural completeness and proper section ordering.

---

### 🎨 2. Design, Layout & Scaling

#### A. Dynamic A4 Scaling Engine
* **How it works:** Renders an A4 document template on screen, scaling it down dynamically to fit any mobile device screen width.
* **Technical Details:**
  - Uses a `ResizeObserver` bound to a stable parent element (`el.parentElement`) rather than the wrapper itself. This completely breaks the recursive layout feedback loops.
  - Computes scale factor: `scale = (parentElementWidth - padding) / 794` (A4 standard width).
  - Applies CSS transform `scale(scale)` with `transformOrigin: 'top left'` on an absolute-positioned container.
  - The relative wrapper width and height are scaled proportionately (`width = 794 * scale`, `height = sheetHeight * scale`) to eliminate extra white margins or overlap blocks.

#### B. Dynamic Height Expansion & Scrolling
* **How it works:** Prevents text overflow at the bottom of the page on longer resumes.
* **Technical Details:**
  - Changed the template preview sheet styles from a fixed `height: 1123px` to `minHeight: 1123px` and removed `overflow: 'hidden'`.
  - Added an active `ResizeObserver` to the unscaled sheet (`sheetRef.current.offsetHeight`) to measure the actual rendered height.
  - Dynamically updates the relative scale wrapper's layout height to `sheetHeight * scale`, making the scroll container scrollable to the exact bottom of the content.
  - Added `pb-32` and `pb-40` scroll offset padding to provide breathing room at the bottom of mobile viewports.

#### C. Mobile Hamburger Menu
* **How it works:** A slide-down menu covering mobile viewports.
* **Technical Details:**
  - Utilizes Lucide icons (`Menu` and `X`) and React state (`isOpen`) inside [Navbar.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/resume%20builder/frontend/src/components/Navbar.jsx) to transition from desktop link rows to a vertical, mobile-friendly overlay.

---

### ⚙️ 3. System, Security & Authentication

#### A. Passwordless OTP Authentication Flow
* **How it works:** Eliminates password management by sending one-time 6-digit codes to the user's email.
* **Technical Details:**
  1. `POST /api/auth/login` generates a cryptographically secure 6-digit verification code.
  2. The code, its hash, and an expiration timestamp (5-minute TTL) are stored in the database.
  3. The OTP is sent to the user via Nodemailer SMTP.
  4. `POST /api/auth/verify-otp` validates the entered code against the database. If correct, the OTP is deleted, and a JWT token (24-hour expiration) is generated and returned to the client.

#### B. SMTP Configuration Fallback
* **How it works:** Prevents application crashes during local development if SMTP credentials are missing.
* **Technical Details:**
  - Inside [email.js](file:///c:/Users/ASUS/OneDrive/Desktop/resume%20builder/backend/src/utils/email.js), if host/user credentials are not set in `.env`, the system automatically prints the OTP directly to the node console log and bypasses SMTP dispatch, allowing offline testing.

#### C. Stealth Admin Authentication
* **How it works:** A hidden admin portal accessed by entering a secret code in the email field.
* **Technical Details:**
  - The standard login page monitors the email input.
  - If the input matches `ADMIN_SECRET_CODE` (checked via a debounced API check), the frontend automatically changes the input type to password and reveals the hidden admin login form.
  - Authenticators check the code and issue an admin-scoped JWT token.

#### D. API Rate Limiting
* **How it works:** Protects authentication and scoring routes from automated attacks and API abuse.
* **Technical Details:**
  - Utilizes `express-rate-limit` to restrict requests on registration, login, and PDF scoring endpoints (e.g., maximum 5 scoring requests per 10 minutes per IP).

---

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
   cd backend
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

# NVIDIA NIM API Key (AI Features)
# Get a free API key with 1,000 free credits at https://build.nvidia.com/models
NVIDIA_API_KEY=nvapi-your-key-here
```

### 💡 How to Get a Free NVIDIA NIM API Key

To power Resumix's AI Scoring, Presets, Bullets Generator, and Chat Coach, you need a free NVIDIA NIM API key:

1. Visit the [NVIDIA NIM Model Catalog](https://build.nvidia.com/models).
2. Browse or select a model (for example, **Llama 3.3 70B Instruct**).
3. Click the **Get API Key** or **Try NIM** button.
4. Sign in or create a free NVIDIA Developer account.
5. Upon registration, you will receive **1,000 free credits** to use their hosted APIs.
6. Generate your personal API Key (starting with `nvapi-`).
7. Copy it and paste it into your `backend/.env` file under `NVIDIA_API_KEY`.

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

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ for developers by Rajat Debnath & the Resumix Open Source Community.*
