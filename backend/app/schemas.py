from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# Schema for AI Structured Output (validated against LLM extraction)
class AIStructuredOutput(BaseModel):
    site: Optional[str] = Field(default=None, description="Site / Plant name where deviation occurred")
    date_of_occurrence: Optional[str] = Field(default=None, description="Date of occurrence (e.g. YYYY-MM-DD)")
    title: Optional[str] = Field(default=None, description="Concise title or short summary of deviation")
    source: Optional[str] = Field(default=None, description="Source or discovery method (e.g. Routine monitoring)")
    related_product: Optional[str] = Field(default=None, description="Related product or material name")
    batch_lot_number: Optional[str] = Field(default=None, description="Batch / Lot number (e.g. ABC-001)")
    detailed_description: Optional[str] = Field(default=None, description="Comprehensive factual description of the event")
    initial_impact: Optional[str] = Field(default=None, description="Categorized impact: Product Quality, Equipment/Facility, Regulatory/Compliance, Safety, Documentation, Other")
    initial_severity: Optional[str] = Field(default=None, description="Recommended severity level: Minor, Major, or Critical")
    severity_reason: Optional[str] = Field(default=None, description="Justification for the recommended severity level")
    confidence: Optional[float] = Field(default=None, description="Extraction confidence score between 0.0 and 1.0")
    key_findings: List[str] = Field(default_factory=list, description="Bullet points of key extracted facts")
    immediate_actions: List[str] = Field(default_factory=list, description="Any immediate corrective containment actions mentioned")

# Schema for Saving a Reviewed Deviation to the Database
class DeviationCreate(BaseModel):
    site: Optional[str] = None
    date_of_occurrence: Optional[str] = None
    title: str = Field(..., min_length=3, description="Title of the deviation")
    source: Optional[str] = None
    related_product: Optional[str] = None
    batch_lot_number: Optional[str] = None
    detailed_description: str = Field(..., min_length=5, description="Detailed description")
    initial_impact: Optional[str] = None
    initial_severity: Optional[str] = None
    severity_reason: Optional[str] = None
    status: Optional[str] = "Draft"
    ai_generated: Optional[bool] = False
    ai_confidence: Optional[float] = None
    raw_input_text: Optional[str] = None

# Schema for Returning Deviation Record
class DeviationResponse(BaseModel):
    id: int
    site: Optional[str]
    date_of_occurrence: Optional[str]
    title: str
    source: Optional[str]
    related_product: Optional[str]
    batch_lot_number: Optional[str]
    detailed_description: str
    initial_impact: Optional[str]
    initial_severity: Optional[str]
    severity_reason: Optional[str]
    status: str
    ai_generated: bool
    ai_confidence: Optional[float]
    raw_input_text: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Response for /api/deviations/analyze
class AnalyzeResponse(BaseModel):
    success: bool
    is_demo_mode: bool
    model_used: str
    data: AIStructuredOutput
    raw_text: str
    processing_time_ms: float
    steps_executed: List[str]
    message: str

# Schema for AI Deviation Chat
class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    deviation_context: Optional[dict] = None
    raw_text: Optional[str] = None
    history: List[ChatMessage] = Field(default_factory=list)

class ChatResponse(BaseModel):
    response: str
    is_demo_mode: bool
    sources: List[str] = Field(default_factory=list)

# CAPA Schemas
class CAPACreate(BaseModel):
    capa_number: Optional[str] = None
    deviation_id: Optional[int] = None
    title: str = Field(..., min_length=3)
    source_event: Optional[str] = None
    root_cause: Optional[str] = None
    corrective_action: str = Field(..., min_length=3)
    preventive_action: str = Field(..., min_length=3)
    assignee: str = Field(..., min_length=2)
    target_due_date: str = Field(..., min_length=4)
    status: Optional[str] = "Open"
    effectiveness_check: Optional[str] = None

class CAPAUpdate(BaseModel):
    title: Optional[str] = None
    root_cause: Optional[str] = None
    corrective_action: Optional[str] = None
    preventive_action: Optional[str] = None
    assignee: Optional[str] = None
    target_due_date: Optional[str] = None
    status: Optional[str] = None
    effectiveness_check: Optional[str] = None

class CAPAResponse(BaseModel):
    id: int
    capa_number: str
    deviation_id: Optional[int]
    title: str
    source_event: Optional[str]
    root_cause: Optional[str]
    corrective_action: str
    preventive_action: str
    assignee: str
    target_due_date: str
    status: str
    effectiveness_check: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# Change Control Schemas
class ChangeControlCreate(BaseModel):
    cc_number: Optional[str] = None
    title: str = Field(..., min_length=3)
    change_type: str = Field(..., min_length=2) # Equipment, Process, Document, Facility
    impact_level: str = Field(..., min_length=2) # Major (Level 1), Moderate (Level 2), Minor (Level 3)
    description: str = Field(..., min_length=5)
    justification: Optional[str] = None
    regulatory_impact: Optional[bool] = False
    status: Optional[str] = "Under Review"
    initiator: str = Field(..., min_length=2)
    target_date: str = Field(..., min_length=4)

class ChangeControlUpdate(BaseModel):
    title: Optional[str] = None
    change_type: Optional[str] = None
    impact_level: Optional[str] = None
    description: Optional[str] = None
    justification: Optional[str] = None
    regulatory_impact: Optional[bool] = None
    status: Optional[str] = None
    initiator: Optional[str] = None
    target_date: Optional[str] = None

class ChangeControlResponse(BaseModel):
    id: int
    cc_number: str
    title: str
    change_type: str
    impact_level: str
    description: str
    justification: Optional[str]
    regulatory_impact: bool
    status: str
    initiator: str
    target_date: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# Audit Schemas
class AuditCreate(BaseModel):
    audit_number: Optional[str] = None
    title: str = Field(..., min_length=3)
    audit_type: str = Field(..., min_length=2) # Internal Self-Inspection, Regulatory, Supplier
    lead_auditor: str = Field(..., min_length=2)
    target_date: str = Field(..., min_length=4)
    status: Optional[str] = "Scheduled"
    findings_critical: Optional[int] = 0
    findings_major: Optional[int] = 0
    findings_minor: Optional[int] = 0
    summary: Optional[str] = None

class AuditUpdate(BaseModel):
    title: Optional[str] = None
    audit_type: Optional[str] = None
    lead_auditor: Optional[str] = None
    target_date: Optional[str] = None
    status: Optional[str] = None
    findings_critical: Optional[int] = None
    findings_major: Optional[int] = None
    findings_minor: Optional[int] = None
    summary: Optional[str] = None

class AuditResponse(BaseModel):
    id: int
    audit_number: str
    title: str
    audit_type: str
    lead_auditor: str
    target_date: str
    status: str
    findings_critical: int
    findings_major: int
    findings_minor: int
    summary: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# Document Schemas
class DocumentCreate(BaseModel):
    doc_number: Optional[str] = None
    title: str = Field(..., min_length=3)
    category: str = Field(..., min_length=2) # SOP, Specification, Batch Record, Protocol, Policy
    version: Optional[str] = "1.0"
    department: str = Field(..., min_length=2)
    effective_date: Optional[str] = None
    review_date: Optional[str] = None
    status: Optional[str] = "Effective"
    author: str = Field(..., min_length=2)
    summary: Optional[str] = None
    content: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    version: Optional[str] = None
    department: Optional[str] = None
    effective_date: Optional[str] = None
    review_date: Optional[str] = None
    status: Optional[str] = None
    author: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    doc_number: str
    title: str
    category: str
    version: str
    department: str
    effective_date: Optional[str]
    review_date: Optional[str]
    status: str
    author: str
    summary: Optional[str]
    content: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Quality Reports Summary Schema
class ReportsSummaryResponse(BaseModel):
    total_deviations: int
    total_capas: int
    total_audits: int
    total_change_controls: int
    total_documents: int
    deviations_by_severity: dict
    deviations_by_impact: dict
    capas_by_status: dict
    audits_by_status: dict
    audit_findings: dict
    change_controls_by_status: dict
    documents_by_category: dict
    compliance_score: int
