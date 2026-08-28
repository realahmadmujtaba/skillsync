from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Application, User
from ..schemas import ApplicationCreate, ApplicationOut, ApplicationUpdate

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationOut])
def list_applications(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[Application]:
    return db.scalars(
        select(Application).where(Application.user_id == user.id)
    ).all()


@router.post("", response_model=ApplicationOut, status_code=201)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Application:
    app = Application(user_id=user.id, **payload.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.patch("/{app_id}", response_model=ApplicationOut)
def update_stage(
    app_id: str,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Application:
    app = db.get(Application, app_id)
    if not app or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    app.stage = payload.stage
    db.commit()
    db.refresh(app)
    return app
