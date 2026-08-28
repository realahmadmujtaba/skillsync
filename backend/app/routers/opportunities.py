from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Opportunity, User
from ..schemas import OpportunityOut

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


@router.get("", response_model=list[OpportunityOut])
def list_opportunities(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> list[OpportunityOut]:
    rows = db.scalars(select(Opportunity).order_by(Opportunity.match.desc())).all()
    return [OpportunityOut.from_model(o) for o in rows]
