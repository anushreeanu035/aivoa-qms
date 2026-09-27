from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from datetime import datetime

from app.database import get_db
from app.models import QMSDocument
from app.schemas import DocumentCreate, DocumentUpdate, DocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
def get_all_documents(
    category: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(QMSDocument)
    if category and category.strip() and category.lower() != "all":
        query = query.filter(QMSDocument.category.ilike(category))
    if department and department.strip() and department.lower() != "all":
        query = query.filter(QMSDocument.department.ilike(department))
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                QMSDocument.doc_number.ilike(term),
                QMSDocument.title.ilike(term),
                QMSDocument.summary.ilike(term)
            )
        )
    return query.order_by(desc(QMSDocument.created_at)).offset(offset).limit(limit).all()

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    doc_in: DocumentCreate,
    db: Session = Depends(get_db)
):
    try:
        doc_num = doc_in.doc_number
        if not doc_num or not doc_num.strip():
            count = db.query(QMSDocument).count() + 1
            prefix = "SOP" if doc_in.category.lower() == "sop" else "DOC"
            doc_num = f"{prefix}-QA-{count:03d}"

        new_doc = QMSDocument(
            doc_number=doc_num,
            title=doc_in.title,
            category=doc_in.category,
            version=doc_in.version or "1.0",
            department=doc_in.department,
            effective_date=doc_in.effective_date,
            review_date=doc_in.review_date,
            status=doc_in.status or "Effective",
            author=doc_in.author,
            summary=doc_in.summary,
            content=doc_in.content
        )
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        return new_doc
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create Document: {str(e)}"
        )

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(QMSDocument).filter(QMSDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document #{doc_id} not found")
    return doc

@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(
    doc_id: int,
    doc_update: DocumentUpdate,
    db: Session = Depends(get_db)
):
    doc = db.query(QMSDocument).filter(QMSDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document #{doc_id} not found")

    update_data = doc_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(doc, field, val)

    try:
        db.commit()
        db.refresh(doc)
        return doc
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update Document #{doc_id}: {str(e)}"
        )

@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(QMSDocument).filter(QMSDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document #{doc_id} not found")
    try:
        db.delete(doc)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete Document: {str(e)}")
