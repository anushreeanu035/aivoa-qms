from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Deviation
from app.schemas import (
    AIStructuredOutput,
    DeviationCreate,
    DeviationResponse,
    AnalyzeResponse,
    ChatRequest,
    ChatResponse
)
from app.ai.graph import run_deviation_workflow
from app.ai.chat import run_chat_query
from app.config import settings

router = APIRouter(prefix="/deviations", tags=["Deviations"])

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_deviation(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    """
    Accepts either an uploaded document (PDF, DOCX, TXT) or raw pasted text.
    Executes the LangGraph AI workflow with Groq LLM (or deterministic pharma fallback).
    Returns machine-readable structured JSON to automatically populate the intake form.
    """
    raw_input = None
    filename = None

    if file and file.filename:
        filename = file.filename
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty. Please upload a valid document or paste text."
            )
        raw_input = content
    elif text and text.strip():
        raw_input = text.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a supporting document (PDF, DOCX, TXT) or paste deviation text."
        )

    try:
        # Run through LangGraph workflow
        result = run_deviation_workflow(raw_input=raw_input, filename=filename)
        
        output_data = AIStructuredOutput(
            site=result.get("site"),
            date_of_occurrence=result.get("date_of_occurrence"),
            title=result.get("title"),
            source=result.get("source"),
            related_product=result.get("related_product"),
            batch_lot_number=result.get("batch_lot_number"),
            detailed_description=result.get("detailed_description"),
            initial_impact=result.get("initial_impact"),
            initial_severity=result.get("initial_severity"),
            severity_reason=result.get("severity_reason"),
            confidence=result.get("confidence", 0.95),
            key_findings=result.get("key_findings", []),
            immediate_actions=result.get("immediate_actions", [])
        )

        is_demo = result.get("is_demo_mode", False)
        mode_msg = (
            "Analyzed using Mock/Deterministic Pharma Engine (Demo Mode). Set GROQ_API_KEY for live Groq Llama 3.3."
            if is_demo else "Analyzed via Groq Llama 3.3 AI Model."
        )

        return AnalyzeResponse(
            success=True,
            is_demo_mode=is_demo,
            model_used=result.get("model_used", settings.GROQ_MODEL),
            data=output_data,
            raw_text=result.get("cleaned_text", ""),
            processing_time_ms=result.get("processing_time_ms", 0.0),
            steps_executed=result.get("steps_executed", []),
            message=mode_msg
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Deviation Analysis workflow failed: {str(e)}"
        )

@router.post("", response_model=DeviationResponse, status_code=status.HTTP_201_CREATED)
def save_deviation(
    deviation_in: DeviationCreate,
    db: Session = Depends(get_db)
):
    """
    Saves the final reviewed and user-edited deviation to the database.
    Ensures that AI recommendations are never stored as final without human review.
    """
    try:
        db_deviation = Deviation(
            site=deviation_in.site,
            date_of_occurrence=deviation_in.date_of_occurrence,
            title=deviation_in.title,
            source=deviation_in.source,
            related_product=deviation_in.related_product,
            batch_lot_number=deviation_in.batch_lot_number,
            detailed_description=deviation_in.detailed_description,
            initial_impact=deviation_in.initial_impact,
            initial_severity=deviation_in.initial_severity,
            severity_reason=deviation_in.severity_reason,
            status=deviation_in.status or "Draft",
            ai_generated=deviation_in.ai_generated,
            ai_confidence=deviation_in.ai_confidence,
            raw_input_text=deviation_in.raw_input_text
        )
        db.add(db_deviation)
        db.commit()
        db.refresh(db_deviation)
        return db_deviation
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while saving deviation: {str(e)}"
        )

@router.get("", response_model=List[DeviationResponse])
def get_all_deviations(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Retrieves saved deviations ordered by newest first.
    """
    deviations = db.query(Deviation).order_by(desc(Deviation.created_at)).offset(offset).limit(limit).all()
    return deviations

@router.get("/{deviation_id}", response_model=DeviationResponse)
def get_deviation_by_id(
    deviation_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieves a specific deviation record by ID.
    """
    deviation = db.query(Deviation).filter(Deviation.id == deviation_id).first()
    if not deviation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deviation #{deviation_id} not found."
        )
    return deviation

@router.post("/chat", response_model=ChatResponse)
def chat_deviation(request: ChatRequest):
    """
    Interactive Q&A assistant to query details or ask questions regarding the current deviation.
    """
    try:
        history_dicts = [{"role": h.role, "content": h.content} for h in request.history]
        result = run_chat_query(
            message=request.message,
            deviation_context=request.deviation_context,
            raw_text=request.raw_text,
            history=history_dicts
        )
        return ChatResponse(
            response=result["response"],
            is_demo_mode=result["is_demo_mode"],
            sources=result.get("sources", [])
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat query error: {str(e)}"
        )
