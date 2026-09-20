# SKILLNEXUS 🚀
**Smart India Hackathon 2026 — Problem Statement SIH26044**  
*Portal for Academia-Industry Collaboration for Skill Mapping, Internships and Placement*

---

## 🌐 Live Service Links

| Application | URL | Role / Purpose |
| :--- | :--- | :--- |
| **Student Portal** | [http://localhost:5173](http://localhost:5173) | Student Assessment, Skill Gap Radar, AI Recommendations, Mentorship & Portfolio |
| **Professional & Academician Portal** | [http://localhost:5174](http://localhost:5174) | Job/Internship Posting, AI Candidate Shortlisting, Talent Sourcing, Collaboration Hub |
| **Backend API & Swagger Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive OpenAPI documentation for all 25+ endpoints |

---

## 🔑 Demo Credentials

| Portal | Role | Email | Password | Pre-seeded Details |
| :--- | :--- | :--- | :--- | :--- |
| **Student App** (`:5173`) | Student | `student@demo.com` | `demo123` | **Aarav Sharma**, B.Tech CSE (3rd Year), IIT Bombay |
| **Pro App** (`:5174`) | Mentor / Recruiter | `professional@demo.com` | `demo123` | **Priya Nair**, Principal Architect, Microsoft India |
| **Pro App** (`:5174`) | Academician | `academic@demo.com` | `demo123` | **Dr. Rajesh Raman**, HOD & Placement Dean, BITS Pilani |

> **Tip**: Both frontend login screens include **1-Click Demo Buttons** (`Use Demo Account`) so you can jump in without typing!

---

## ⚡ One-Command Startup

To launch the backend and both frontends simultaneously:

### Windows Batch File (Command Prompt)
Double-click `start-all.bat` or run:
```cmd
start-all.bat
```

### Windows PowerShell
```powershell
.\start-all.ps1
```

### Manual Individual Startup
1. **Backend**:
   ```bash
   cd backend
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Student App**:
   ```bash
   cd student-app
   npm.cmd run dev
   ```
3. **Professional App**:
   ```bash
   cd professional-app
   npm.cmd run dev
   ```

---

## 🔄 Instant Demo Reset
Need a fresh database during evaluation?
- Click the **"Reset Demo"** button on the top-right of the Professional Portal navbar (`:5174`).
- Or call the endpoint:
  ```bash
  curl -X POST http://127.0.0.1:8000/api/demo/reset
  ```

---

## ⏱️ 3-Minute Live Hackathon Demo Script (Click-by-Click)

### 0:00 - 0:45 | Student Portal & AI Assessment
1. Open [http://localhost:5173/login](http://localhost:5173/login) in your first browser window.
2. Click **"Use Demo Account"** &rarr; logs into Aarav Sharma's dashboard.
3. Click **"Skill Assessment"** in the sidebar:
   - Answer 3-4 questions, highlight the progress bar and category tags (`Technical` vs `Soft Skills`).
   - Click **"Submit Assessment"** &rarr; showcase the real-time **Recharts RadarChart** mapping proficiency (Levels 1-5).

### 0:45 - 1:30 | Skill Gap Analysis & AI Matching
4. Click **"Skill Gap Analysis"** (`/skill-gap`):
   - Switch target role dropdown from *Full Stack Developer* to *Data Analyst*.
   - Point out the **Recharts Bar Chart** comparing current level vs industry minimum standard.
   - Show missing skill chips linked to accredited NPTEL / SWAYAM courses.
5. Click **"Opportunities"** (`/opportunities`):
   - Highlight the **Match % Badges** generated via scikit-learn cosine similarity.
   - Click on an internship card to open the detail modal &rarr; click **"Submit Application"**.
   - Navigate to **"My Applications"** (`/applications`) &rarr; show the Kanban status pipeline.

### 1:30 - 2:15 | Professional Portal: Posting & Candidate Shortlisting
6. Open [http://localhost:5174/login](http://localhost:5174/login) in your second browser window.
7. Click **"Mentor / Recruiter Demo"** &rarr; logs into Priya Nair (Microsoft India).
8. Click **"Post Opportunity"** (`/post-opportunity`):
   - Enter title *"Cloud Native AI Intern"*, add required skills (*Python, React, Docker*), and click **"Publish"**.
9. Click **"Shortlisting"** (`/candidates`):
   - Select the opportunity &rarr; show applicants ranked by AI match percentage.
   - Click **"Shortlist"** or **"Schedule Interview"** and enter mentor feedback: *"Stellar React foundations. Shortlisted for Technical Round 1."*
10. Switch back to the Student tab &rarr; refresh **"My Applications"** to demonstrate real-time status update to **"Interview Scheduled"** with the mentor's note!

### 2:15 - 3:00 | Mentorship, Peer Skill Trade & Analytics
11. In Student app, click **"Mentors & Exchange"** (`/mentorship`):
    - Book an open session slot with Priya Nair.
    - Open **"Propose Skill Exchange"** modal (*"I can teach React, I want to learn Distributed Systems"*).
12. In Professional app, click **"Placement Analytics"** (`/analytics`):
    - Showcase the **Industry Skill Frequency Chart** (top skills demanded across companies).
    - Showcase the **College-wise Skill Gap Matrix** (IIT Bombay, BITS Pilani, VJTI).
    - Click **"Export Analytics CSV"** to download the live spreadsheet.
