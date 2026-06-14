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

## Active Task Tracking
Please check [tracker.md](file:///c:/Users/ASUS/OneDrive/Desktop/resume builder/tracker.md) to check active development progress.
