from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import CORS_ORIGINS
from routers import auth, common, student, professional

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SKILLNEXUS API",
    description="Smart India Hackathon 2026 (SIH26044) - Portal for Academia-Industry Collaboration for Skill Mapping, Internships & Placement",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for local dev and public deployment
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(student.router, prefix="/api")
app.include_router(professional.router, prefix="/api")
app.include_router(common.router, prefix="/api")


@app.get("/")
def root():
    return {
        "project": "SKILLNEXUS",
        "problem_statement": "SIH26044",
        "title": "Portal for Academia-Industry collaboration for Skill Mapping, Internships and Placement",
        "status": "Online",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/demo/reset")
def reset_demo_database():
    from seed import seed_database
    seed_database()
    return {"status": "success", "message": "Demo database successfully re-seeded with 15 students, 5 professionals, 2 academicians, 60 assessment questions, and 25 opportunities."}
