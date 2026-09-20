from typing import List, Dict, Any, Optional
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User,
    StudentProfile,
    ProfessionalProfile,
    Opportunity,
    Application,
    LearningProgram,
    MentorshipSlot,
    SkillExchange,
    Skill,
    PortfolioItem,
    CollaborationProposal
)
from schemas import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityOut,
    CandidateMatchOut,
    ApplicationUpdate,
    ApplicationOut,
    LearningProgramCreate,
    LearningProgramOut,
    MentorshipSlotCreate,
    MentorshipSlotComplete,
    MentorshipSlotOut,
    SkillExchangeUpdate,
    SkillExchangeOut,
    AnalyticsOverviewOut,
    SkillDemandItem
)
from auth.dependencies import require_role
from ai.matching import compute_match_score, build_skill_vocabulary, ROLE_REQUIREMENTS

router = APIRouter(tags=["Professional & Academician"])


# --- Opportunities Management (CRUD) ---

@router.post("/opportunities", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    payload: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    opp = Opportunity(
        posted_by=current_user.id,
        type=payload.type,
        title=payload.title,
        company=payload.company,
        description=payload.description,
        required_skills=payload.required_skills,
        location=payload.location,
        mode=payload.mode,
        stipend_or_salary=payload.stipend_or_salary,
        deadline=payload.deadline,
        status="open"
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp


@router.put("/opportunities/{opp_id}", response_model=OpportunityOut)
def update_opportunity(
    opp_id: int,
    payload: OpportunityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    # Only creator or admin/academician can update
    if opp.posted_by != current_user.id and current_user.role != "academician":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this opportunity")

    data = payload.dict(exclude_unset=True)
    for key, value in data.items():
        setattr(opp, key, value)

    db.commit()
    db.refresh(opp)
    return opp


@router.delete("/opportunities/{opp_id}")
def delete_opportunity(
    opp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    if opp.posted_by != current_user.id and current_user.role != "academician":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this opportunity")

    db.delete(opp)
    db.commit()
    return {"message": "Opportunity deleted successfully"}


# --- Candidate Matching for Opportunity ---

@router.get("/opportunities/{opp_id}/candidates", response_model=List[CandidateMatchOut])
def get_opportunity_candidates(
    opp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    applications = db.query(Application).filter(Application.opportunity_id == opp_id).all()
    all_skills = [s.name for s in db.query(Skill).all()]
    vocabulary = build_skill_vocabulary(all_skills)
    req_skills = opp.required_skills if isinstance(opp.required_skills, list) else []

    results = []
    for app in applications:
        student = app.student
        profile = student.student_profile if student else None
        student_skills = profile.skills if profile and profile.skills else {}

        match_score, _, _ = compute_match_score(
            student_skills=student_skills,
            required_skills=req_skills,
            vocabulary=vocabulary
        )

        results.append({
            "application_id": app.id,
            "student_id": student.id,
            "student_name": student.name,
            "student_email": student.email,
            "college": student.organization,
            "degree": profile.degree if profile else "B.Tech",
            "branch": profile.branch if profile else "CSE",
            "year": profile.year if profile else "3rd Year",
            "skills": student_skills,
            "match_percent": match_score,
            "status": app.status,
            "applied_at": app.applied_at,
            "mentor_feedback": app.mentor_feedback
        })

    # Rank descending by match percent
    results.sort(key=lambda x: x["match_percent"], reverse=True)
    return results


# --- Application Status Update & Feedback ---

@router.patch("/applications/{app_id}", response_model=ApplicationOut)
def update_application_status(
    app_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app.status = payload.status
    if payload.mentor_feedback is not None:
        app.mentor_feedback = payload.mentor_feedback

    db.commit()
    db.refresh(app)
    return app


# --- Learning Programs ---

@router.post("/learning-programs", response_model=LearningProgramOut, status_code=status.HTTP_201_CREATED)
def create_learning_program(
    payload: LearningProgramCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    program = LearningProgram(
        posted_by=current_user.id,
        title=payload.title,
        provider=payload.provider,
        skills_covered=payload.skills_covered,
        type=payload.type,
        url=payload.url,
        duration=payload.duration
    )
    db.add(program)
    db.commit()
    db.refresh(program)
    return program


# --- Mentorship Slots ---

@router.post("/mentorship/slots", response_model=MentorshipSlotOut, status_code=status.HTTP_201_CREATED)
def create_mentorship_slot(
    payload: MentorshipSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    slot = MentorshipSlot(
        mentor_id=current_user.id,
        topic=payload.topic,
        datetime=payload.datetime,
        status="open"
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)

    prof = current_user.professional_profile
    return {
        "id": slot.id,
        "mentor_id": slot.mentor_id,
        "mentor_name": current_user.name,
        "mentor_company": prof.company if prof else current_user.organization,
        "topic": slot.topic,
        "datetime": slot.datetime,
        "status": slot.status,
        "booked_by": slot.booked_by,
        "student_name": None,
        "feedback": slot.feedback
    }


@router.get("/mentorship/mine", response_model=List[MentorshipSlotOut])
def get_my_mentorship_slots(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    slots = db.query(MentorshipSlot).filter(MentorshipSlot.mentor_id == current_user.id).all()
    prof = current_user.professional_profile
    results = []
    for s in slots:
        student = db.query(User).filter(User.id == s.booked_by).first() if s.booked_by else None
        results.append({
            "id": s.id,
            "mentor_id": s.mentor_id,
            "mentor_name": current_user.name,
            "mentor_company": prof.company if prof else current_user.organization,
            "topic": s.topic,
            "datetime": s.datetime,
            "status": s.status,
            "booked_by": s.booked_by,
            "student_name": student.name if student else None,
            "feedback": s.feedback
        })
    return results


@router.patch("/mentorship/{slot_id}/complete", response_model=MentorshipSlotOut)
def complete_mentorship_slot(
    slot_id: int,
    payload: MentorshipSlotComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    slot = db.query(MentorshipSlot).filter(
        MentorshipSlot.id == slot_id,
        MentorshipSlot.mentor_id == current_user.id
    ).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentorship slot not found or not owned by you")

    slot.status = "completed"
    slot.feedback = payload.feedback

    db.commit()
    db.refresh(slot)

    student = db.query(User).filter(User.id == slot.booked_by).first() if slot.booked_by else None
    prof = current_user.professional_profile
    return {
        "id": slot.id,
        "mentor_id": slot.mentor_id,
        "mentor_name": current_user.name,
        "mentor_company": prof.company if prof else current_user.organization,
        "topic": slot.topic,
        "datetime": slot.datetime,
        "status": slot.status,
        "booked_by": slot.booked_by,
        "student_name": student.name if student else None,
        "feedback": slot.feedback
    }


# --- Skill Exchange Management ---

@router.get("/skill-exchange/requests", response_model=List[SkillExchangeOut])
def get_skill_exchange_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    exchanges = (
        db.query(SkillExchange)
        .filter(SkillExchange.professional_id == current_user.id)
        .order_by(SkillExchange.created_at.desc())
        .all()
    )
    results = []
    for ex in exchanges:
        student = db.query(User).filter(User.id == ex.student_id).first()
        results.append({
            "id": ex.id,
            "student_id": ex.student_id,
            "student_name": student.name if student else "Student",
            "professional_id": ex.professional_id,
            "professional_name": current_user.name,
            "offered_skill": ex.offered_skill,
            "requested_skill": ex.requested_skill,
            "status": ex.status,
            "note": ex.note,
            "created_at": ex.created_at
        })
    return results


@router.patch("/skill-exchange/{exchange_id}", response_model=SkillExchangeOut)
def update_skill_exchange_status(
    exchange_id: int,
    payload: SkillExchangeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    ex = db.query(SkillExchange).filter(
        SkillExchange.id == exchange_id,
        SkillExchange.professional_id == current_user.id
    ).first()
    if not ex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill exchange request not found")

    ex.status = payload.status
    db.commit()
    db.refresh(ex)

    student = db.query(User).filter(User.id == ex.student_id).first()
    return {
        "id": ex.id,
        "student_id": ex.student_id,
        "student_name": student.name if student else "Student",
        "professional_id": ex.professional_id,
        "professional_name": current_user.name,
        "offered_skill": ex.offered_skill,
        "requested_skill": ex.requested_skill,
        "status": ex.status,
        "note": ex.note,
        "created_at": ex.created_at
    }


# --- Analytics Endpoints ---

@router.get("/analytics/overview", response_model=AnalyticsOverviewOut)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    total_students = db.query(User).filter(User.role == "student").count()
    total_opportunities = db.query(Opportunity).count()
    total_applications = db.query(Application).count()

    # Status distribution
    status_counts = {"applied": 0, "shortlisted": 0, "interview": 0, "selected": 0, "rejected": 0}
    apps = db.query(Application.status).all()
    for (st,) in apps:
        if st in status_counts:
            status_counts[st] += 1

    # Demanded skills
    all_opps = db.query(Opportunity).all()
    skill_counter = Counter()
    for opp in all_opps:
        skills = opp.required_skills if isinstance(opp.required_skills, list) else []
        for s in skills:
            skill_counter[s] += 1

    top_demanded = [
        {"skill": skill, "count": count}
        for skill, count in skill_counter.most_common(8)
    ]

    # Average readiness score across students with skills
    profiles = db.query(StudentProfile).all()
    readiness_scores = []
    for p in profiles:
        skills = p.skills if isinstance(p.skills, dict) else {}
        if skills:
            # Average score against standard benchmark (e.g. Full Stack or Data Analyst)
            total = sum(min(v, 5) for v in skills.values())
            possible = len(skills) * 5
            score = (total / possible * 100.0) if possible > 0 else 0
            readiness_scores.append(score)

    avg_readiness = round(sum(readiness_scores) / len(readiness_scores), 1) if readiness_scores else 68.5

    # Placement funnel counts
    placement_funnel = {
        "applied": status_counts["applied"] + status_counts["shortlisted"] + status_counts["interview"] + status_counts["selected"] + status_counts["rejected"],
        "shortlisted": status_counts["shortlisted"] + status_counts["interview"] + status_counts["selected"],
        "interview": status_counts["interview"] + status_counts["selected"],
        "selected": status_counts["selected"]
    }

    return {
        "total_students": total_students,
        "total_opportunities": total_opportunities,
        "total_applications": total_applications,
        "applications_by_status": status_counts,
        "top_demanded_skills": top_demanded,
        "average_readiness_score": avg_readiness,
        "placement_funnel": placement_funnel
    }


@router.get("/analytics/skill-demand", response_model=List[SkillDemandItem])
def get_skill_demand(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    open_opps = db.query(Opportunity).filter(Opportunity.status == "open").all()
    total_opps = len(open_opps) if len(open_opps) > 0 else 1

    skill_counter = Counter()
    for opp in open_opps:
        skills = opp.required_skills if isinstance(opp.required_skills, list) else []
        for s in skills:
            skill_counter[s] += 1

    results = []
    for skill, count in skill_counter.most_common(20):
        pct = round((count / total_opps) * 100.0, 1)
        results.append({
            "skill": skill,
            "count": count,
            "percentage": pct
        })

    return results


# --- Talent Search ---

@router.get("/talent/search")
def search_talent(
    skill: Optional[str] = None,
    min_level: int = 1,
    college: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    students = db.query(User).filter(User.role == "student").all()
    results = []

    target_skill = skill.strip().lower() if skill else None
    target_college = college.strip().lower() if college else None

    for stu in students:
        prof = stu.student_profile
        sks = prof.skills if prof and isinstance(prof.skills, dict) else {}

        # If skill filter applied
        matched_level = None
        if target_skill:
            for s_name, s_lvl in sks.items():
                if target_skill in s_name.lower():
                    matched_level = s_lvl
                    break
            if matched_level is None or matched_level < min_level:
                continue

        # If college filter applied
        if target_college and target_college not in (stu.organization or "").lower():
            continue

        portfolio_items = [
            {"id": p.id, "title": p.title, "type": p.type, "link": p.link, "verified": p.verified}
            for p in stu.portfolio_items
        ]

        # Calculate student overall rating
        avg_score = (sum(sks.values()) / (len(sks) * 5) * 100) if len(sks) > 0 else 50.0

        results.append({
            "id": stu.id,
            "name": stu.name,
            "email": stu.email,
            "college": stu.organization,
            "degree": prof.degree if prof else "B.Tech",
            "branch": prof.branch if prof else "CSE",
            "year": prof.year if prof else "3rd Year",
            "interests": prof.interests if prof else "",
            "skills": sks,
            "overall_match_score": round(avg_score, 1),
            "matched_skill_level": matched_level,
            "portfolio": portfolio_items
        })

    # Sort descending by match score or matched skill level
    results.sort(key=lambda x: (x["matched_skill_level"] or 0, x["overall_match_score"]), reverse=True)
    return results


# --- Industry-Academia Collaboration Proposals ---

@router.get("/collaborations")
def list_collaborations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    proposals = db.query(CollaborationProposal).order_by(CollaborationProposal.created_at.desc()).all()
    results = []
    for p in proposals:
        proposer = p.proposer
        results.append({
            "id": p.id,
            "proposer_id": p.proposer_id,
            "proposer_name": proposer.name if proposer else "Partner",
            "proposer_role": proposer.role if proposer else "professional",
            "institution_or_company": p.institution_or_company,
            "type": p.type,
            "title": p.title,
            "description": p.description,
            "status": p.status,
            "created_at": p.created_at
        })
    return results


@router.post("/collaborations", status_code=status.HTTP_201_CREATED)
def create_collaboration_proposal(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    proposal = CollaborationProposal(
        proposer_id=current_user.id,
        type=payload.get("type", "live_project"),
        title=payload.get("title", "Industry Project Proposal"),
        description=payload.get("description", ""),
        institution_or_company=payload.get("institution_or_company", current_user.organization or "Institution"),
        status="open"
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return {
        "id": proposal.id,
        "proposer_name": current_user.name,
        "title": proposal.title,
        "type": proposal.type,
        "status": proposal.status
    }


@router.patch("/collaborations/{proposal_id}")
def update_collaboration_status(
    proposal_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["professional", "academician"]))
):
    prop = db.query(CollaborationProposal).filter(CollaborationProposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    if "status" in payload:
        prop.status = payload["status"]
    db.commit()
    db.refresh(prop)
    return {"id": prop.id, "status": prop.status, "message": "Collaboration status updated."}
