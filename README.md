# Part-Time Job Listing App

This is a simple client-side web application that allows users to browse, register, and apply for part-time jobs.  
The application was created as part of the COMP1004 Software Development coursework.

---

## Features

- Browse job listings with title, category, reward, and contact info
- Search by keyword and filter by category
- Mark jobs as favorites (stored in localStorage)
- Switch between users (User 1, 2, 3)
- Apply to jobs, cancel applications
- Employers can view applications by each user
- Users can register new job listings
- All data is stored in the browser (no backend required)

---

## Technologies Used

- HTML5 + CSS3
- JavaScript (Vanilla)
- JSON (for initial job data)
- `localStorage` for persistent data

---

## Project Structure

├── comp1004.html   # Main HTML file (layout, forms, UI)
├── comp1004.js     # JavaScript logic (rendering, interaction, localStorage)
├── comp1004.json   # Sample job data (loaded on first visit)
└── README.md       # You're here!

---

## Setup

1. Clone or download the repository
2. Open `comp1004.html` in your browser (no server needed!)
3. Use developer tools (F12) to track localStorage activity and job data

---

## Notes on Privacy & Storage

- No backend or server is used
- All job data, favorites, and applications are stored locally in your browser via `localStorage`
- Switching users is purely simulated (e.g., User 1 / User 2)

---

## Learning Objectives

- Understand DOM manipulation and event handling
- Build a complete Single Page Application (SPA) without frameworks
- Simulate user-based data interactions in a local environment
- Practice UI/UX design, error handling, and code organization
