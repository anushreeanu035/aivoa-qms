from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from app.database import get_db
from app.models import Audit
from app.schemas import AuditCreate, AuditUpdate, AuditResponse

router = APIRouter(prefix="/audits", tags=["Audits"])

@router.get("", response_model=List[AuditResponse])
def get_all_audits(
    status_filter: Optional[str] = None,
    type_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Audit)
    if status_filter and status_filter.strip() and status_filter.lower() != "all":
        query = query.filter(Audit.status.ilike(status_filter))
    if type_filter and type_filter.strip() and type_filter.lower() != "all":
        query = query.filter(Audit.audit_type.ilike(type_filter))
    return query.order_by(desc(Audit.created_at)).offset(offset).limit(limit).all()

@router.post("", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
def create_audit(
    audit_in: AuditCreate,
    db: Session = Depends(get_db)
):
    try:
        audit_num = audit_in.audit_number
        if not audit_num or not audit_num.strip():
            count = db.query(Audit).count() + 1
            year = datetime.utcnow().year
            audit_num = f"AUD-{year}-{count:03d}"

        new_audit = Audit(
            audit_number=audit_num,
            title=audit_in.title,
            audit_type=audit_in.audit_type,
            lead_auditor=audit_in.lead_auditor,
            target_date=audit_in.target_date,
            status=audit_in.status or "Scheduled",
            findings_critical=audit_in.findings_critical or 0,
            findings_major=audit_in.findings_major or 0,
            findings_minor=audit_in.findings_minor or 0,
            summary=audit_in.summary
        )
        db.add(new_audit)
        db.commit()
        db.refresh(new_audit)
        return new_audit
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create Audit: {str(e)}"
        )

@router.get("/{audit_id}", response_model=AuditResponse)
def get_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail=f"Audit #{audit_id} not found")
    return audit

@router.put("/{audit_id}", response_model=AuditResponse)
def update_audit(
    audit_id: int,
    audit_update: AuditUpdate,
    db: Session = Depends(get_db)
):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail=f"Audit #{audit_id} not found")

    update_data = audit_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(audit, field, val)

    try:
        db.commit()
        db.refresh(audit)
        return audit
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update Audit #{audit_id}: {str(e)}"
        )

@router.delete("/{audit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail=f"Audit #{audit_id} not found")
    try:
        db.delete(audit)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete Audit: {str(e)}")
