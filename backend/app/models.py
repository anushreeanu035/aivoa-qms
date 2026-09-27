from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey
from app.database import Base

class Deviation(Base):
    __tablename__ = "deviations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    site = Column(String(255), nullable=True)
    date_of_occurrence = Column(String(50), nullable=True)
    title = Column(String(500), nullable=False)
    source = Column(String(255), nullable=True)
    related_product = Column(String(255), nullable=True)
    batch_lot_number = Column(String(100), nullable=True)
    detailed_description = Column(Text, nullable=False)
    initial_impact = Column(String(100), nullable=True)
    initial_severity = Column(String(50), nullable=True)
    severity_reason = Column(Text, nullable=True)
    
    # Audit & Tracking metadata
    status = Column(String(50), default="Draft", nullable=False)
    ai_generated = Column(Boolean, default=True)
    ai_confidence = Column(Float, nullable=True)
    raw_input_text = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "site": self.site,
            "date_of_occurrence": self.date_of_occurrence,
            "title": self.title,
            "source": self.source,
            "related_product": self.related_product,
            "batch_lot_number": self.batch_lot_number,
            "detailed_description": self.detailed_description,
            "initial_impact": self.initial_impact,
            "initial_severity": self.initial_severity,
            "severity_reason": self.severity_reason,
            "status": self.status,
            "ai_generated": self.ai_generated,
            "ai_confidence": self.ai_confidence,
            "raw_input_text": self.raw_input_text,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class CAPA(Base):
    __tablename__ = "capas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    capa_number = Column(String(50), unique=True, nullable=False)
    deviation_id = Column(Integer, nullable=True)
    title = Column(String(500), nullable=False)
    source_event = Column(String(255), nullable=True)
    root_cause = Column(Text, nullable=True)
    corrective_action = Column(Text, nullable=False)
    preventive_action = Column(Text, nullable=False)
    assignee = Column(String(255), nullable=False)
    target_due_date = Column(String(50), nullable=False)
    status = Column(String(50), default="Open", nullable=False) # Open, In Progress, Effectiveness Check, Closed
    effectiveness_check = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "capa_number": self.capa_number,
            "deviation_id": self.deviation_id,
            "title": self.title,
            "source_event": self.source_event,
            "root_cause": self.root_cause,
            "corrective_action": self.corrective_action,
            "preventive_action": self.preventive_action,
            "assignee": self.assignee,
            "target_due_date": self.target_due_date,
            "status": self.status,
            "effectiveness_check": self.effectiveness_check,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class ChangeControl(Base):
    __tablename__ = "change_controls"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cc_number = Column(String(50), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    change_type = Column(String(100), nullable=False) # Equipment, Process, Document, Facility
    impact_level = Column(String(50), nullable=False) # Major (Level 1), Moderate (Level 2), Minor (Level 3)
    description = Column(Text, nullable=False)
    justification = Column(Text, nullable=True)
    regulatory_impact = Column(Boolean, default=False)
    status = Column(String(50), default="Under Review", nullable=False) # Draft, Under Review, Approved, Implemented, Closed
    initiator = Column(String(255), nullable=False)
    target_date = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "cc_number": self.cc_number,
            "title": self.title,
            "change_type": self.change_type,
            "impact_level": self.impact_level,
            "description": self.description,
            "justification": self.justification,
            "regulatory_impact": self.regulatory_impact,
            "status": self.status,
            "initiator": self.initiator,
            "target_date": self.target_date,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    audit_number = Column(String(50), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    audit_type = Column(String(100), nullable=False) # Internal Self-Inspection, Regulatory, Supplier
    lead_auditor = Column(String(255), nullable=False)
    target_date = Column(String(50), nullable=False)
    status = Column(String(50), default="Scheduled", nullable=False) # Scheduled, In Progress, Report Issued, Closed
    findings_critical = Column(Integer, default=0)
    findings_major = Column(Integer, default=0)
    findings_minor = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "audit_number": self.audit_number,
            "title": self.title,
            "audit_type": self.audit_type,
            "lead_auditor": self.lead_auditor,
            "target_date": self.target_date,
            "status": self.status,
            "findings_critical": self.findings_critical,
            "findings_major": self.findings_major,
            "findings_minor": self.findings_minor,
            "summary": self.summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class QMSDocument(Base):
    __tablename__ = "qms_documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doc_number = Column(String(50), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False) # SOP, Specification, Batch Record, Protocol, Policy
    version = Column(String(20), default="1.0", nullable=False)
    department = Column(String(100), nullable=False) # Quality Assurance, Quality Control, Production, Engineering, Regulatory Affairs
    effective_date = Column(String(50), nullable=True)
    review_date = Column(String(50), nullable=True)
    status = Column(String(50), default="Effective", nullable=False) # Effective, Under Review, Draft, Superseded
    author = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "doc_number": self.doc_number,
            "title": self.title,
            "category": self.category,
            "version": self.version,
            "department": self.department,
            "effective_date": self.effective_date,
            "review_date": self.review_date,
            "status": self.status,
            "author": self.author,
            "summary": self.summary,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
