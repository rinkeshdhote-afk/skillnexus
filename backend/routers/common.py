from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models import Opportunity, LearningProgram, User, ProfessionalProfile, Skill, MentorshipSlot
from schemas import OpportunityOut, LearningProgramOut

router = APIRouter(tags=["Shared & Exploration"])


@router.get("/opportunities", response_model=List[OpportunityOut])
def list_opportunities(
    type: Optional[str] = Query(None, description="Filter by type (internship, job, project, etc.)"),
    mode: Optional[str] = Query(None, description="Filter by mode (remote, onsite, hybrid)"),
    search: Optional[str] = Query(None, description="Keyword search in title, company, or skills"),
    status: Optional[str] = Query(None, description="Filter by status (open, closed)"),
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity)
    if status:
        query = query.filter(Opportunity.status == status)
    else:
        query = query.filter(Opportunity.status == "open")

    if type:
        query = query.filter(Opportunity.type == type)
    if mode:
        query = query.filter(Opportunity.mode == mode)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(term),
                Opportunity.company.ilike(term),
                Opportunity.description.ilike(term),
                Opportunity.location.ilike(term)
            )
        )

    return query.order_by(Opportunity.created_at.desc()).all()


@router.get("/opportunities/{opp_id}", response_model=OpportunityOut)
def get_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    return opp


@router.get("/learning-programs", response_model=List[LearningProgramOut])
def list_learning_programs(db: Session = Depends(get_db)):
    return db.query(LearningProgram).all()


@router.get("/mentors")
def list_mentors(db: Session = Depends(get_db)):
    mentors = (
        db.query(User)
        .filter(User.role.in_(["professional", "academician"]))
        .all()
    )
    result = []
    for m in mentors:
        prof = m.professional_profile
        open_slots = (
            db.query(MentorshipSlot)
            .filter(MentorshipSlot.mentor_id == m.id, MentorshipSlot.status == "open")
            .all()
        )
        result.append({
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "role": m.role,
            "organization": m.organization,
            "designation": prof.designation if prof else "Mentor",
            "company": prof.company if prof else (m.organization or "Partner"),
            "expertise": prof.expertise if prof else [],
            "years_experience": prof.years_experience if prof else 0.0,
            "sub_role": prof.sub_role if prof else "mentor",
            "open_slots": [
                {
                    "id": s.id,
                    "topic": s.topic,
                    "datetime": s.datetime,
                    "status": s.status
                }
                for s in open_slots
            ]
        })
    return result


@router.get("/skills")
def list_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.name.asc()).all()
    return [{"id": s.id, "name": s.name, "category": s.category} for s in skills]
