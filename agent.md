# Antigravity Agent Information & Workspace Notes

This file details the development details, choices, and notes during development of the Resumix Application.

## Architecture Guidelines & Choices

- **Backend Location**: Files live inside `backend/src/`. This modularity separates router/controller/model code from configuration and environment setups.
- **Frontend Modularity**: React components are split into layout modules, auth modules, template builders, and utility scorers.
- **ATS Compliance Strategy**: The PDF generation avoids multi-column grids (which confuse ATS parsers) and relies on semantic headers, clean standard font lists, and native CSS printable layouts. This creates true text files instead of non-selectable images.
- **Environment Handling**: Ports are configured dynamically with safe fallbacks (e.g. `5000` for backend, `5173` for frontend).

## Active Task Tracking
Please check [tracker.md](file:///c:/Users/ASUS/OneDrive/Desktop/resume builder/tracker.md) to check active development progress.
