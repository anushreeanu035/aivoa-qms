from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from app.database import get_db
from app.models import CAPA, Deviation
from app.schemas import CAPACreate, CAPAUpdate, CAPAResponse

router = APIRouter(prefix="/capas", tags=["CAPAs"])

@router.get("", response_model=List[CAPAResponse])
def get_all_capas(
    status_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(CAPA)
    if status_filter and status_filter.strip() and status_filter.lower() != "all":
        query = query.filter(CAPA.status.ilike(status_filter))
    return query.order_by(desc(CAPA.created_at)).offset(offset).limit(limit).all()

@router.post("", response_model=CAPAResponse, status_code=status.HTTP_201_CREATED)
def create_capa(
    capa_in: CAPACreate,
    db: Session = Depends(get_db)
):
    try:
        # Generate CAPA number if not provided
        capa_num = capa_in.capa_number
        if not capa_num or not capa_num.strip():
            count = db.query(CAPA).count() + 1
            year = datetime.utcnow().year
            capa_num = f"CAPA-{year}-{count:03d}"

        new_capa = CAPA(
            capa_number=capa_num,
            deviation_id=capa_in.deviation_id,
            title=capa_in.title,
            source_event=capa_in.source_event,
            root_cause=capa_in.root_cause,
            corrective_action=capa_in.corrective_action,
            preventive_action=capa_in.preventive_action,
            assignee=capa_in.assignee,
            target_due_date=capa_in.target_due_date,
            status=capa_in.status or "Open",
            effectiveness_check=capa_in.effectiveness_check
        )
        db.add(new_capa)
        db.commit()
        db.refresh(new_capa)
        return new_capa
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create CAPA: {str(e)}"
        )

@router.get("/{capa_id}", response_model=CAPAResponse)
def get_capa(capa_id: int, db: Session = Depends(get_db)):
    capa = db.query(CAPA).filter(CAPA.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail=f"CAPA #{capa_id} not found")
    return capa

@router.put("/{capa_id}", response_model=CAPAResponse)
def update_capa(
    capa_id: int,
    capa_update: CAPAUpdate,
    db: Session = Depends(get_db)
):
    capa = db.query(CAPA).filter(CAPA.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail=f"CAPA #{capa_id} not found")

    update_data = capa_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(capa, field, val)

    try:
        db.commit()
        db.refresh(capa)
        return capa
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update CAPA #{capa_id}: {str(e)}"
        )

@router.delete("/{capa_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_capa(capa_id: int, db: Session = Depends(get_db)):
    capa = db.query(CAPA).filter(CAPA.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail=f"CAPA #{capa_id} not found")
    try:
        db.delete(capa)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete CAPA: {str(e)}")

@router.post("/from-deviation/{deviation_id}", response_model=CAPAResponse, status_code=status.HTTP_201_CREATED)
def create_capa_from_deviation(deviation_id: int, db: Session = Depends(get_db)):
    deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
    if not deviation:
        raise HTTPException(status_code=404, detail=f"Deviation #{deviation_id} not found")

    count = db.query(CAPA).count() + 1
    year = datetime.utcnow().year
    capa_num = f"CAPA-{year}-{count:03d}"

    source_info = f"Deviation DEV-{deviation.id} ({deviation.title})"
    root_cause_default = (
        f"Investigation pending root-cause analysis for {deviation.title}. "
        f"Initial severity classified as {deviation.initial_severity or 'Major'}. "
        f"Observed impact on {deviation.initial_impact or 'Product Quality'}."
    )
    corrective_default = f"Quarantine batch {deviation.batch_lot_number or 'affected material'} and perform immediate containment check."
    preventive_default = f"Review equipment maintenance and operator training logs for site {deviation.site or 'Synthesis Unit'}."

    new_capa = CAPA(
        capa_number=capa_num,
        deviation_id=deviation.id,
        title=f"CAPA: {deviation.title}",
        source_event=source_info,
        root_cause=root_cause_default,
        corrective_action=corrective_default,
        preventive_action=preventive_default,
        assignee="QA Investigation Lead",
        target_due_date=(datetime.utcnow().date()).isoformat(),
        status="Open",
        effectiveness_check="Validate resolution over 3 subsequent production cycles."
    )
    db.add(new_capa)
    db.commit()
    db.refresh(new_capa)
    return new_capa
