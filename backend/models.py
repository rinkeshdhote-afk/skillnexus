from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    Float,
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # student | professional | academician
    organization = Column(String(200), nullable=True)  # college or company
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    professional_profile = relationship("ProfessionalProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    opportunities_posted = relationship("Opportunity", back_populates="creator", foreign_keys="Opportunity.posted_by")
    applications = relationship("Application", back_populates="student", foreign_keys="Application.student_id")
    portfolio_items = relationship("PortfolioItem", back_populates="student")
    mentorship_slots_created = relationship("MentorshipSlot", back_populates="mentor", foreign_keys="MentorshipSlot.mentor_id")
    mentorship_slots_booked = relationship("MentorshipSlot", back_populates="student", foreign_keys="MentorshipSlot.booked_by")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    degree = Column(String(100), default="B.Tech")
    branch = Column(String(100), default="Computer Science & Engineering")
    year = Column(String(50), default="3rd Year")
    interests = Column(Text, default="")
    skills = Column(JSON, default=dict)  # {"Python": 4, "SQL": 3}
    assessment_done = Column(Boolean, default=False)

    user = relationship("User", back_populates="student_profile")


class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    designation = Column(String(150), default="")
    company = Column(String(150), default="")
    expertise = Column(JSON, default=list)  # ["Python", "System Design", "Cloud"]
    years_experience = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=True)
    sub_role = Column(String(50), default="mentor")  # mentor | recruiter

    user = relationship("User", back_populates="professional_profile")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), default="technical")  # technical | soft


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # internship | job | apprenticeship | project | fdp | workshop
    title = Column(String(200), nullable=False)
    company = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)  # ["Python", "SQL", "FastAPI"]
    location = Column(String(150), default="Remote")
    mode = Column(String(50), default="remote")  # remote | onsite | hybrid
    stipend_or_salary = Column(String(100), default="Competitive")
    deadline = Column(String(100), nullable=True)
    status = Column(String(50), default="open")  # open | closed
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="opportunities_posted", foreign_keys=[posted_by])
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    status = Column(String(50), default="applied")  # applied | shortlisted | interview | selected | rejected
    applied_at = Column(DateTime, default=datetime.utcnow)
    mentor_feedback = Column(Text, nullable=True)

    student = relationship("User", back_populates="applications", foreign_keys=[student_id])
    opportunity = relationship("Opportunity", back_populates="applications", foreign_keys=[opportunity_id])


class LearningProgram(Base):
    __tablename__ = "learning_programs"

    id = Column(Integer, primary_key=True, index=True)
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(250), nullable=False)
    provider = Column(String(150), nullable=False)
    skills_covered = Column(JSON, default=list)  # ["Machine Learning", "Python"]
    type = Column(String(50), default="course")  # course | certification | workshop
    url = Column(String(500), nullable=True)
    duration = Column(String(100), default="4 weeks")


class MentorshipSlot(Base):
    __tablename__ = "mentorship_slots"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(200), nullable=False)
    datetime = Column(String(100), nullable=False)
    status = Column(String(50), default="open")  # open | booked | completed
    booked_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    feedback = Column(Text, nullable=True)

    mentor = relationship("User", back_populates="mentorship_slots_created", foreign_keys=[mentor_id])
    student = relationship("User", back_populates="mentorship_slots_booked", foreign_keys=[booked_by])


class SkillExchange(Base):
    __tablename__ = "skill_exchanges"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    offered_skill = Column(String(100), nullable=False)
    requested_skill = Column(String(100), nullable=False)
    status = Column(String(50), default="pending")  # pending | accepted | rejected | completed
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id])
    professional = relationship("User", foreign_keys=[professional_id])


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # project | certificate | internship | achievement
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    verified = Column(Boolean, default=False)

    student = relationship("User", back_populates="portfolio_items")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    skill = Column(String(100), nullable=False, index=True)
    category = Column(String(50), default="technical")  # technical | soft
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # ["Option A", "Option B", "Option C", "Option D"]
    correct_index = Column(Integer, nullable=False)


class CollaborationProposal(Base):
    __tablename__ = "collaboration_proposals"

    id = Column(Integer, primary_key=True, index=True)
    proposer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # guest_lecture | live_project | innovation_challenge | curriculum_review | fdp
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    institution_or_company = Column(String(200), nullable=False)
    status = Column(String(50), default="open")  # open | accepted | completed
    created_at = Column(DateTime, default=datetime.utcnow)

    proposer = relationship("User", foreign_keys=[proposer_id])
