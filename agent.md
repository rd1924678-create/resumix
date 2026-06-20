# Antigravity Agent Information & Workspace Notes

This file details the development details, choices, and notes during development of the Resumix Application.

## Architecture Guidelines & Choices

- **Backend Location**: Files live inside `backend/src/`. This modularity separates router/controller/model code from configuration and environment setups.
- **Frontend Modularity**: React components are split into layout modules, auth modules, template builders, and utility scorers.
- **ATS Compliance Strategy**: The PDF generation avoids multi-column grids (which confuse ATS parsers) and relies on semantic headers, clean standard font lists, and native CSS printable layouts. This creates true text files instead of non-selectable images.
- **Passwordless OTP System**: Regular users authenticate without passwords. The backend creates a 6-digit OTP code on registration/login, saves it with a 10-minute expiry time, and delivers it via `nodemailer` using SMTP configurations.
- **Secret Code Check**: Admin login is secured by detecting a secret code entered in the email input field. This check is processed via a POST request on the backend (`POST /api/auth/check-secret-code`) to match the code against `ADMIN_SECRET_CODE` in `.env` without exposing the secret to the client.
- **Centralized Mock Data**: The mock resume data is saved inside [mockData.json](file:///frontend/src/utils/mockData.json) under `"Your Name"` and `"your.email@gmail.com"` placeholders, ensuring that previews load realistically and uniformly.
- **Environment Handling**: Ports are configured dynamically with safe fallbacks (e.g. `5000` for backend, `5173` for frontend).

---

## Dynamic Sector & Role-Specific ATS Scorer

 Resumix features a dynamic sector/role evaluation option on the main ATS Scorer page (`/ats-scorer`). This changes the evaluator's system instructions from a rigid IT/Software-only scope to a highly adaptable industry context.

### 1. Frontend Architecture (`frontend/src/`)
- **UI File**: [ATSScorer.jsx](file:///c:/Users/ASUS/OneDrive/Desktop/resume%20builder/frontend/src/pages/ATSScorer.jsx)
  - Features an interactive dropdown sector selector card positioned above the drag-and-drop zone.
  - Predefined sectors: IT & Software Engineering (default), Finance & Banking, Healthcare & Medicine, Marketing, HR, Education, Creative, and Engineering.
  - Interactive "Other" option: When chosen, renders an animated text input for custom role/sector inputs (e.g. "Graphic Designer", "Data Analyst").
  - State management:
    - `sector`: Selected sector dropdown value.
    - `customRole`: Value of custom text entry when "Other" is chosen.
    - `analyzedSector`: Remembers the exact sector name used during analysis to display it on the results card and configure chat suggestions.
- **API File**: [api.js](file:///c:/Users/ASUS/OneDrive/Desktop/resume%20builder/frontend/src/services/api.js)
  - Updated `atsService.chatResume` method signature to pass `sector` to the chat request payload:
    ```javascript
    chatResume: (resumeText, messages, sector) => api.post('/api/ats/chat', { resumeText, messages, sector }),
    ```
- **Analysis Integration**:
  - In `handleAnalyze`, the active sector name is calculated and appended as a text field inside the upload payload:
    ```javascript
    formData.append('sector', activeSector);
    ```

### 2. Backend Architecture (`backend/src/`)
- **Controller File**: [atsController.js](file:///c:/Users/ASUS/OneDrive/Desktop/resume%20builder/backend/src/controllers/atsController.js)
  - **`scoreResume` endpoint**: 
    - Extracts `sector` from `req.body.sector` (defaulting to `'IT & Software Engineering'`).
    - Feeds this context into the prompt templates sent to `llama-3.3-70b-instruct`.
    - Customizes instructions for category scores (impact, brevity, style, sections) and keyword matching rules to align with that sector's standards.
  - **`chatWithResume` endpoint**:
    - Extracts `sector` from `req.body.sector`.
    - Configures the career advisor LLM's system prompt to address the candidate specifically for the target industry's best practices.

---

## Active Task Tracking
Please check [tracker.md](file:///c:/Users/ASUS/OneDrive/Desktop/resume builder/tracker.md) and [task.md](file:///C:/Users/ASUS/.gemini/antigravity-ide/brain/a4c5c181-7e40-45d6-8172-133eea609102/task.md) to check active development progress.
