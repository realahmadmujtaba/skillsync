from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import InterviewResult, User
from ..schemas import InterviewCreate, InterviewOut

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


@router.get("", response_model=list[InterviewOut])
def list_results(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[InterviewResult]:
    return db.scalars(
        select(InterviewResult)
        .where(InterviewResult.user_id == user.id)
        .order_by(InterviewResult.created_at.desc())
    ).all()


@router.post("", response_model=InterviewOut, status_code=201)
def save_result(
    payload: InterviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> InterviewResult:
    result = InterviewResult(user_id=user.id, **payload.model_dump())
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
