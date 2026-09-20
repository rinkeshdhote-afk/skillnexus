from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# --- Auth & User Schemas ---

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(student|professional|academician)$")
    organization: Optional[str] = "College / Company"
    # Optional Student Profile fields
    degree: Optional[str] = "B.Tech"
    branch: Optional[str] = "Computer Science & Engineering"
    year: Optional[str] = "3rd Year"
    interests: Optional[str] = ""
    # Optional Professional Profile fields
    designation: Optional[str] = "Software Engineer"
    company: Optional[str] = ""
    years_experience: Optional[float] = 0.0
    sub_role: Optional[str] = "mentor"  # mentor | recruiter


class UserLogin(BaseModel):
    email: str
    password: str


class StudentProfileOut(BaseModel):
    degree: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    interests: Optional[str] = None
    skills: Dict[str, int] = {}
    assessment_done: bool = False

    class Config:
        from_attributes = True


class ProfessionalProfileOut(BaseModel):
    designation: Optional[str] = None
    company: Optional[str] = None
    expertise: List[str] = []
    years_experience: Optional[float] = 0.0
    is_verified: bool = True
    sub_role: Optional[str] = "mentor"

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    organization: Optional[str] = None
    created_at: Optional[datetime] = None
    student_profile: Optional[StudentProfileOut] = None
    professional_profile: Optional[ProfessionalProfileOut] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Assessment Schemas ---

class QuestionOut(BaseModel):
    id: int
    skill: str
    category: str
    question: str
    options: List[str]

    class Config:
        from_attributes = True


class AssessmentSubmit(BaseModel):
    # Mapping of question_id (as str or int) -> chosen option index (0-3)
    answers: Dict[int, int]


class AssessmentResultOut(BaseModel):
    skills_scored: Dict[str, int]
    total_score: int
    total_questions: int
    message: str


# --- Skill Gap & Recommendation Schemas ---

class SkillStatus(BaseModel):
    skill: str
    required_level: int
    current_level: int
    met: bool


class SkillGapOut(BaseModel):
    target_role: str
    readiness_percentage: float
    matched_skills: List[SkillStatus]
    missing_skills: List[SkillStatus]
    recommended_programs: List[Dict[str, Any]]


class OpportunityRecommendationOut(BaseModel):
    opportunity: Dict[str, Any]
    match_percent: float
    matching_skills: List[str]
    missing_skills: List[str]


# --- Opportunity Schemas ---

class OpportunityCreate(BaseModel):
    type: str = Field(..., pattern="^(internship|job|apprenticeship|project|fdp|workshop)$")
    title: str = Field(..., min_length=3, max_length=200)
    company: str = Field(..., min_length=2, max_length=150)
    description: str
    required_skills: List[str] = []
    location: str = "Remote"
    mode: str = Field("remote", pattern="^(remote|onsite|hybrid)$")
    stipend_or_salary: str = "Competitive"
    deadline: Optional[str] = None


class OpportunityUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    location: Optional[str] = None
    mode: Optional[str] = None
    stipend_or_salary: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None  # open | closed


class OpportunityOut(BaseModel):
    id: int
    posted_by: int
    type: str
    title: str
    company: str
    description: str
    required_skills: List[str] = []
    location: str
    mode: str
    stipend_or_salary: str
    deadline: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CandidateMatchOut(BaseModel):
    application_id: int
    student_id: int
    student_name: str
    student_email: str
    college: Optional[str]
    degree: Optional[str]
    branch: Optional[str]
    year: Optional[str]
    skills: Dict[str, int]
    match_percent: float
    status: str
    applied_at: Optional[datetime]
    mentor_feedback: Optional[str]


# --- Application Schemas ---

class ApplicationCreate(BaseModel):
    opportunity_id: int


class ApplicationUpdate(BaseModel):
    status: str = Field(..., pattern="^(applied|shortlisted|interview|selected|rejected)$")
    mentor_feedback: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    student_id: int
    opportunity_id: int
    status: str
    applied_at: Optional[datetime] = None
    mentor_feedback: Optional[str] = None
    opportunity: Optional[OpportunityOut] = None

    class Config:
        from_attributes = True


# --- Learning Program Schemas ---

class LearningProgramCreate(BaseModel):
    title: str
    provider: str
    skills_covered: List[str] = []
    type: str = Field("course", pattern="^(course|certification|workshop)$")
    url: Optional[str] = None
    duration: str = "4 weeks"


class LearningProgramOut(BaseModel):
    id: int
    posted_by: Optional[int] = None
    title: str
    provider: str
    skills_covered: List[str] = []
    type: str
    url: Optional[str] = None
    duration: str

    class Config:
        from_attributes = True


# --- Mentorship Schemas ---

class MentorshipSlotCreate(BaseModel):
    topic: str
    datetime: str


class MentorshipSlotComplete(BaseModel):
    feedback: str


class MentorshipSlotOut(BaseModel):
    id: int
    mentor_id: int
    mentor_name: Optional[str] = None
    mentor_company: Optional[str] = None
    topic: str
    datetime: str
    status: str
    booked_by: Optional[int] = None
    student_name: Optional[str] = None
    feedback: Optional[str] = None

    class Config:
        from_attributes = True


# --- Skill Exchange Schemas ---

class SkillExchangeCreate(BaseModel):
    professional_id: int
    offered_skill: str
    requested_skill: str
    note: Optional[str] = None


class SkillExchangeUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|accepted|rejected|completed)$")


class SkillExchangeOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    professional_id: int
    professional_name: Optional[str] = None
    offered_skill: str
    requested_skill: str
    status: str
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Portfolio Item Schemas ---

class PortfolioItemCreate(BaseModel):
    type: str = Field(..., pattern="^(project|certificate|internship|achievement)$")
    title: str
    description: str
    link: Optional[str] = None


class PortfolioItemUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    verified: Optional[bool] = None


class PortfolioItemOut(BaseModel):
    id: int
    student_id: int
    type: str
    title: str
    description: str
    link: Optional[str] = None
    verified: bool

    class Config:
        from_attributes = True


# --- Analytics Schemas ---

class AnalyticsOverviewOut(BaseModel):
    total_students: int
    total_opportunities: int
    total_applications: int
    applications_by_status: Dict[str, int]
    top_demanded_skills: List[Dict[str, Any]]
    average_readiness_score: float
    placement_funnel: Dict[str, int]


class SkillDemandItem(BaseModel):
    skill: str
    count: int
    percentage: float
