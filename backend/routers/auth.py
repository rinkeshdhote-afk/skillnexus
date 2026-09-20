from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, StudentProfile, ProfessionalProfile
from schemas import UserRegister, UserLogin, Token, UserOut
from auth.security import get_password_hash, verify_password, create_access_token
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Check if email is taken
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Hash password
    pwd_hash = get_password_hash(payload.password)

    new_user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=pwd_hash,
        role=payload.role,
        organization=payload.organization or ("College" if payload.role == "student" else "Company")
    )
    db.add(new_user)
    db.flush()

    if payload.role == "student":
        student_prof = StudentProfile(
            user_id=new_user.id,
            degree=payload.degree or "B.Tech",
            branch=payload.branch or "Computer Science & Engineering",
            year=payload.year or "3rd Year",
            interests=payload.interests or "",
            skills={},
            assessment_done=False
        )
        db.add(student_prof)
    elif payload.role in ("professional", "academician"):
        prof_subrole = payload.sub_role if payload.role == "professional" else "mentor"
        prof_profile = ProfessionalProfile(
            user_id=new_user.id,
            designation=payload.designation or ("Professor" if payload.role == "academician" else "Software Engineer"),
            company=payload.company or payload.organization or "Industry Partner",
            expertise=[],
            years_experience=payload.years_experience or 2.0,
            is_verified=True,
            sub_role=prof_subrole
        )
        db.add(prof_profile)

    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "id": new_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
