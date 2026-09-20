# SKILLNEXUS Backend 🚀
**Smart India Hackathon 2026 (SIH26044)**  
*Portal for Academia-Industry Collaboration for Skill Mapping, Internships and Placement*

---

## 🌟 Overview
The SKILLNEXUS backend is built with **FastAPI**, **SQLAlchemy (SQLite)**, **Pydantic v2**, and **scikit-learn**. It bridges the gap between students, industry professionals, and academicians by providing:
- **Role-Based Access Control (RBAC)** for `student`, `professional`, and `academician`.
- **AI Matching Engine**: Uses TF-IDF skill vocabulary representations and cosine similarity to match students with industry opportunities and rank candidates for recruiters.
- **Rule-Based Skill-Gap Analyzer**: Analyzes student proficiency against target role benchmarks (*Data Analyst, Full Stack Developer, ML Engineer, Cloud Engineer, Cybersecurity Analyst, UI/UX Designer, Business Analyst*) and recommends curated learning programs for missing skills.
- **Placement & Assessment Management**: Assessment tests, application status workflow (`applied` &rarr; `shortlisted` &rarr; `interview` &rarr; `selected`), mentorship slot bookings, portfolio management, and skill exchange.
- **Real-Time Analytics**: Demanded skill frequencies, placement funnel tracking, and readiness distribution.

---

## 🔑 Pre-seeded Demo Credentials
| Role | Email | Password | Organization / Company |
| :--- | :--- | :--- | :--- |
| **Student** | `student@demo.com` | `demo123` | IIT Bombay |
| **Professional (Mentor)** | `professional@demo.com` | `demo123` | Microsoft India |
| **Academician** | `academic@demo.com` | `demo123` | BITS Pilani |

---

## ⚙️ Installation & Running

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Seed Demo Data
To populate the database with 15 students, 5 professionals, 2 academicians, 60 assessment questions, 25 opportunities, 12 learning programs, and 15 mentorship slots:
```bash
python seed.py
```

### 3. Run the Development Server
```bash
uvicorn main:app --reload --port 8000
```
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

### 4. Run Automated Test Suite
To verify all endpoints and the AI engine end-to-end:
```bash
python test_endpoints.py
```

---

## 📡 Key API Endpoints (Prefix `/api`)

### Auth
- `POST /api/auth/register` - Create account with role-specific profile
- `POST /api/auth/login` - Authenticate and retrieve JWT token
- `GET /api/auth/me` - Current authenticated user details

### Student
- `GET /api/assessment/questions` - Assessment MCQs across technical and soft skills
- `POST /api/assessment/submit` - Evaluates answers and saves skill levels (1-5) into profile
- `GET /api/student/skill-gap?target_role=...` - Computes readiness %, matched/missing skills, and recommended courses
- `GET /api/student/recommendations` - Top 10 opportunities ranked by cosine similarity
- `GET /api/opportunities` - Filterable by type, mode, keyword search
- `POST /api/applications` - Apply to an opportunity
- `GET /api/applications/mine` - View student applications and status
- `POST /api/mentorship/book/{slot_id}` - Book mentorship session
- `GET /api/portfolio` | `POST /api/portfolio` | `PUT /api/portfolio/{id}` | `DELETE /api/portfolio/{id}` - Portfolio CRUD
- `POST /api/skill-exchange` - Request skill exchange with a mentor

### Professional & Academician
- `POST /api/opportunities` | `PUT /api/opportunities/{id}` | `DELETE /api/opportunities/{id}` - Opportunity management
- `GET /api/opportunities/{id}/candidates` - Applicants ranked by skill match %
- `PATCH /api/applications/{id}` - Update application status & add mentor feedback
- `POST /api/learning-programs` - Post course or certification
- `POST /api/mentorship/slots` | `GET /api/mentorship/mine` | `PATCH /api/mentorship/{id}/complete` - Mentorship management
- `GET /api/skill-exchange/requests` | `PATCH /api/skill-exchange/{id}` - Manage incoming exchange requests
- `GET /api/analytics/overview` - Funnel metrics, readiness scores, and student count
- `GET /api/analytics/skill-demand` - Skill frequency across open opportunities

---

## 🌐 CORS Configuration
Configured out of the box for the two frontend apps:
- `http://localhost:5173` (Student App)
- `http://localhost:5174` (Professional App)
