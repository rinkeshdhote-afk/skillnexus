from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User,
    StudentProfile,
    AssessmentQuestion,
    Opportunity,
    Application,
    LearningProgram,
    MentorshipSlot,
    SkillExchange,
    PortfolioItem,
    Skill
)
from schemas import (
    QuestionOut,
    AssessmentSubmit,
    AssessmentResultOut,
    SkillGapOut,
    OpportunityRecommendationOut,
    ApplicationCreate,
    ApplicationOut,
    PortfolioItemCreate,
    PortfolioItemUpdate,
    PortfolioItemOut,
    SkillExchangeCreate,
    SkillExchangeOut
)
from auth.dependencies import get_current_user, require_role
from ai.matching import compute_match_score, analyze_skill_gap, build_skill_vocabulary

router = APIRouter(tags=["Student"])


# --- Assessment Endpoints ---

@router.get("/assessment/questions", response_model=List[QuestionOut])
def get_assessment_questions(
    skill: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AssessmentQuestion)
    if skill:
        query = query.filter(AssessmentQuestion.skill.ilike(skill.strip()))
    return query.all()


@router.post("/assessment/submit", response_model=AssessmentResultOut)
def submit_assessment(
    payload: AssessmentSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    answers = payload.answers  # {question_id: chosen_index}
    if not answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No answers were submitted."
        )

    question_ids = list(answers.keys())
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.id.in_(question_ids)).all()

    # Track scores per skill
    skill_stats = {}  # {skill: {"correct": int, "total": int}}
    total_correct = 0

    for q in questions:
        skill_name = q.skill
        if skill_name not in skill_stats:
            skill_stats[skill_name] = {"correct": 0, "total": 0}

        skill_stats[skill_name]["total"] += 1
        submitted_idx = answers.get(q.id)
        if submitted_idx == q.correct_index:
            skill_stats[skill_name]["correct"] += 1
            total_correct += 1

    # Convert accuracy percentage to skill level (1 to 5)
    scored_skills = {}
    for skill_name, stats in skill_stats.items():
        ratio = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
        if ratio >= 0.8:
            level = 5
        elif ratio >= 0.6:
            level = 4
        elif ratio >= 0.4:
            level = 3
        elif ratio >= 0.2:
            level = 2
        else:
            level = 1
        scored_skills[skill_name] = level

    # Update student profile
    student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student_profile:
        student_profile = StudentProfile(user_id=current_user.id, skills={})
        db.add(student_profile)

    current_skills = dict(student_profile.skills or {})
    current_skills.update(scored_skills)
    student_profile.skills = current_skills
    student_profile.assessment_done = True

    db.commit()
    db.refresh(student_profile)

    return {
        "skills_scored": scored_skills,
        "total_score": total_correct,
        "total_questions": len(questions),
        "message": f"Assessment completed! Scored {total_correct}/{len(questions)} correct across {len(scored_skills)} skills."
    }


# --- Skill Gap Analysis ---

@router.get("/student/skill-gap", response_model=SkillGapOut)
def get_skill_gap(
    target_role: str = Query("Data Analyst", description="Target job profile"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    skills = student_profile.skills if student_profile and student_profile.skills else {}

    learning_programs = db.query(LearningProgram).all()
    gap_result = analyze_skill_gap(skills, target_role, learning_programs)

    return gap_result


# --- Recommendations (AI Cosine Similarity) ---

@router.get("/student/recommendations", response_model=List[OpportunityRecommendationOut])
def get_opportunity_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    student_skills = student_profile.skills if student_profile and student_profile.skills else {}

    all_skills = [s.name for s in db.query(Skill).all()]
    vocabulary = build_skill_vocabulary(all_skills)

    opportunities = db.query(Opportunity).filter(Opportunity.status == "open").all()

    ranked_results = []
    for opp in opportunities:
        req_skills = opp.required_skills if isinstance(opp.required_skills, list) else []
        match_score, matching_s, missing_s = compute_match_score(
            student_skills=student_skills,
            required_skills=req_skills,
            vocabulary=vocabulary
        )

        ranked_results.append({
            "opportunity": {
                "id": opp.id,
                "posted_by": opp.posted_by,
                "type": opp.type,
                "title": opp.title,
                "company": opp.company,
                "description": opp.description,
                "required_skills": req_skills,
                "location": opp.location,
                "mode": opp.mode,
                "stipend_or_salary": opp.stipend_or_salary,
                "deadline": opp.deadline,
                "status": opp.status,
                "created_at": opp.created_at.isoformat() if opp.created_at else None
            },
            "match_percent": match_score,
            "matching_skills": matching_s,
            "missing_skills": missing_s
        })

    # Sort descending by match percent
    ranked_results.sort(key=lambda x: x["match_percent"], reverse=True)
    return ranked_results[:10]


# --- Applications ---

@router.post("/applications", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def apply_to_opportunity(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    opp = db.query(Opportunity).filter(Opportunity.id == payload.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    if opp.status != "open":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Opportunity is closed for applications")

    existing_app = db.query(Application).filter(
        Application.student_id == current_user.id,
        Application.opportunity_id == payload.opportunity_id
    ).first()
    if existing_app:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already applied for this opportunity")

    new_app = Application(
        student_id=current_user.id,
        opportunity_id=payload.opportunity_id,
        status="applied"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@router.get("/applications/mine", response_model=List[ApplicationOut])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    return (
        db.query(Application)
        .filter(Application.student_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )


# --- Mentorship Booking ---

@router.post("/mentorship/book/{slot_id}")
def book_mentorship_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    slot = db.query(MentorshipSlot).filter(MentorshipSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentorship slot not found")
    if slot.status != "open":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This mentorship slot is already booked or completed")

    slot.status = "booked"
    slot.booked_by = current_user.id
    db.commit()
    db.refresh(slot)

    return {
        "message": f"Mentorship session for '{slot.topic}' booked successfully with Mentor!",
        "slot_id": slot.id,
        "datetime": slot.datetime,
        "status": slot.status
    }


# --- Portfolio CRUD ---

@router.get("/portfolio", response_model=List[PortfolioItemOut])
def list_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    return db.query(PortfolioItem).filter(PortfolioItem.student_id == current_user.id).all()


@router.post("/portfolio", response_model=PortfolioItemOut, status_code=status.HTTP_201_CREATED)
def create_portfolio_item(
    payload: PortfolioItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    item = PortfolioItem(
        student_id=current_user.id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        link=payload.link,
        verified=False
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/portfolio/{item_id}", response_model=PortfolioItemOut)
def update_portfolio_item(
    item_id: int,
    payload: PortfolioItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.student_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio item not found")

    if payload.type is not None:
        item.type = payload.type
    if payload.title is not None:
        item.title = payload.title
    if payload.description is not None:
        item.description = payload.description
    if payload.link is not None:
        item.link = payload.link

    db.commit()
    db.refresh(item)
    return item


@router.delete("/portfolio/{item_id}")
def delete_portfolio_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    item = db.query(PortfolioItem).filter(
        PortfolioItem.id == item_id,
        PortfolioItem.student_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio item not found")

    db.delete(item)
    db.commit()
    return {"message": "Portfolio item deleted successfully"}


# --- Skill Exchange ---

@router.post("/skill-exchange", response_model=SkillExchangeOut, status_code=status.HTTP_201_CREATED)
def request_skill_exchange(
    payload: SkillExchangeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    pro = db.query(User).filter(
        User.id == payload.professional_id,
        User.role.in_(["professional", "academician"])
    ).first()
    if not pro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Professional/Mentor not found")

    req = SkillExchange(
        student_id=current_user.id,
        professional_id=payload.professional_id,
        offered_skill=payload.offered_skill,
        requested_skill=payload.requested_skill,
        note=payload.note,
        status="pending"
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    return {
        "id": req.id,
        "student_id": req.student_id,
        "student_name": current_user.name,
        "professional_id": req.professional_id,
        "professional_name": pro.name,
        "offered_skill": req.offered_skill,
        "requested_skill": req.requested_skill,
        "status": req.status,
        "note": req.note,
        "created_at": req.created_at
    }


@router.get("/skill-exchange/mine", response_model=List[SkillExchangeOut])
def get_my_skill_exchanges(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    exchanges = db.query(SkillExchange).filter(SkillExchange.student_id == current_user.id).order_by(SkillExchange.created_at.desc()).all()
    results = []
    for ex in exchanges:
        pro = db.query(User).filter(User.id == ex.professional_id).first()
        results.append({
            "id": ex.id,
            "student_id": ex.student_id,
            "student_name": current_user.name,
            "professional_id": ex.professional_id,
            "professional_name": pro.name if pro else "Professional",
            "offered_skill": ex.offered_skill,
            "requested_skill": ex.requested_skill,
            "status": ex.status,
            "note": ex.note,
            "created_at": ex.created_at
        })
    return results
