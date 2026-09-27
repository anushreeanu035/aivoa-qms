from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from app.database import get_db
from app.models import ChangeControl
from app.schemas import ChangeControlCreate, ChangeControlUpdate, ChangeControlResponse

router = APIRouter(prefix="/change-controls", tags=["Change Control"])

@router.get("", response_model=List[ChangeControlResponse])
def get_all_change_controls(
    status_filter: Optional[str] = None,
    type_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(ChangeControl)
    if status_filter and status_filter.strip() and status_filter.lower() != "all":
        query = query.filter(ChangeControl.status.ilike(status_filter))
    if type_filter and type_filter.strip() and type_filter.lower() != "all":
        query = query.filter(ChangeControl.change_type.ilike(type_filter))
    return query.order_by(desc(ChangeControl.created_at)).offset(offset).limit(limit).all()

@router.post("", response_model=ChangeControlResponse, status_code=status.HTTP_201_CREATED)
def create_change_control(
    cc_in: ChangeControlCreate,
    db: Session = Depends(get_db)
):
    try:
        cc_num = cc_in.cc_number
        if not cc_num or not cc_num.strip():
            count = db.query(ChangeControl).count() + 1
            year = datetime.utcnow().year
            cc_num = f"CC-{year}-{count:03d}"

        new_cc = ChangeControl(
            cc_number=cc_num,
            title=cc_in.title,
            change_type=cc_in.change_type,
            impact_level=cc_in.impact_level,
            description=cc_in.description,
            justification=cc_in.justification,
            regulatory_impact=cc_in.regulatory_impact or False,
            status=cc_in.status or "Under Review",
            initiator=cc_in.initiator,
            target_date=cc_in.target_date
        )
        db.add(new_cc)
        db.commit()
        db.refresh(new_cc)
        return new_cc
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create Change Control: {str(e)}"
        )

@router.get("/{cc_id}", response_model=ChangeControlResponse)
def get_change_control(cc_id: int, db: Session = Depends(get_db)):
    cc = db.query(ChangeControl).filter(ChangeControl.id == cc_id).first()
    if not cc:
        raise HTTPException(status_code=404, detail=f"Change Control #{cc_id} not found")
    return cc

@router.put("/{cc_id}", response_model=ChangeControlResponse)
def update_change_control(
    cc_id: int,
    cc_update: ChangeControlUpdate,
    db: Session = Depends(get_db)
):
    cc = db.query(ChangeControl).filter(ChangeControl.id == cc_id).first()
    if not cc:
        raise HTTPException(status_code=404, detail=f"Change Control #{cc_id} not found")

    update_data = cc_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(cc, field, val)

    try:
        db.commit()
        db.refresh(cc)
        return cc
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update Change Control #{cc_id}: {str(e)}"
        )

@router.delete("/{cc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_change_control(cc_id: int, db: Session = Depends(get_db)):
    cc = db.query(ChangeControl).filter(ChangeControl.id == cc_id).first()
    if not cc:
        raise HTTPException(status_code=404, detail=f"Change Control #{cc_id} not found")
    try:
        db.delete(cc)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete Change Control: {str(e)}")
