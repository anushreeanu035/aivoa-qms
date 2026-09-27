import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Deviation, CAPA, ChangeControl, Audit, QMSDocument
from app.schemas import ReportsSummaryResponse

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/summary", response_model=ReportsSummaryResponse)
def get_reports_summary(db: Session = Depends(get_db)):
    total_devs = db.query(Deviation).count()
    total_capas = db.query(CAPA).count()
    total_audits = db.query(Audit).count()
    total_ccs = db.query(ChangeControl).count()
    total_docs = db.query(QMSDocument).count()

    # Deviations by severity
    dev_severities = db.query(Deviation.initial_severity, func.count(Deviation.id)).group_by(Deviation.initial_severity).all()
    dev_by_sev = {sev or "Unclassified": count for sev, count in dev_severities}

    # Deviations by impact
    dev_impacts = db.query(Deviation.initial_impact, func.count(Deviation.id)).group_by(Deviation.initial_impact).all()
    dev_by_impact = {imp or "Unclassified": count for imp, count in dev_impacts}

    # CAPAs by status
    capa_statuses = db.query(CAPA.status, func.count(CAPA.id)).group_by(CAPA.status).all()
    capas_by_stat = {st or "Open": count for st, count in capa_statuses}

    # Audits by status & findings
    audit_statuses = db.query(Audit.status, func.count(Audit.id)).group_by(Audit.status).all()
    audits_by_stat = {st or "Scheduled": count for st, count in audit_statuses}

    critical_findings = db.query(func.sum(Audit.findings_critical)).scalar() or 0
    major_findings = db.query(func.sum(Audit.findings_major)).scalar() or 0
    minor_findings = db.query(func.sum(Audit.findings_minor)).scalar() or 0
    audit_findings = {
        "Critical": int(critical_findings),
        "Major": int(major_findings),
        "Minor": int(minor_findings)
    }

    # Change controls by status
    cc_statuses = db.query(ChangeControl.status, func.count(ChangeControl.id)).group_by(ChangeControl.status).all()
    ccs_by_stat = {st or "Under Review": count for st, count in cc_statuses}

    # Documents by category
    doc_categories = db.query(QMSDocument.category, func.count(QMSDocument.id)).group_by(QMSDocument.category).all()
    docs_by_cat = {cat or "SOP": count for cat, count in doc_categories}

    # Compliance Health Score calculation (0 to 100)
    # Starts at 100, deducted by critical findings (-15 each), open major deviations (-5), unaddressed CAPAs
    base_score = 96
    if critical_findings > 0:
        base_score -= min(30, int(critical_findings) * 15)
    if dev_by_sev.get("Critical", 0) > 0:
        base_score -= min(20, dev_by_sev.get("Critical", 0) * 10)
    compliance_score = max(50, min(100, base_score))

    return ReportsSummaryResponse(
        total_deviations=total_devs,
        total_capas=total_capas,
        total_audits=total_audits,
        total_change_controls=total_ccs,
        total_documents=total_docs,
        deviations_by_severity=dev_by_sev,
        deviations_by_impact=dev_by_impact,
        capas_by_status=capas_by_stat,
        audits_by_status=audits_by_stat,
        audit_findings=audit_findings,
        change_controls_by_status=ccs_by_stat,
        documents_by_category=docs_by_cat,
        compliance_score=compliance_score
    )

@router.get("/export/{module}")
def export_module_csv(module: str, db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)

    mod = module.lower()
    if mod in ["deviations", "deviation"]:
        records = db.query(Deviation).all()
        writer.writerow(["ID", "Title", "Site", "Batch/Lot", "Impact", "Severity", "Status", "Date of Occurrence", "Created At"])
        for r in records:
            writer.writerow([r.id, r.title, r.site, r.batch_lot_number, r.initial_impact, r.initial_severity, r.status, r.date_of_occurrence, r.created_at])
        filename = "deviations_export.csv"

    elif mod in ["capas", "capa"]:
        records = db.query(CAPA).all()
        writer.writerow(["ID", "CAPA Number", "Title", "Source Event", "Assignee", "Status", "Due Date", "Created At"])
        for r in records:
            writer.writerow([r.id, r.capa_number, r.title, r.source_event, r.assignee, r.status, r.target_due_date, r.created_at])
        filename = "capas_export.csv"

    elif mod in ["change-controls", "change_controls", "change-control"]:
        records = db.query(ChangeControl).all()
        writer.writerow(["ID", "CC Number", "Title", "Type", "Impact Level", "Regulatory Impact", "Status", "Initiator", "Target Date"])
        for r in records:
            writer.writerow([r.id, r.cc_number, r.title, r.change_type, r.impact_level, "Yes" if r.regulatory_impact else "No", r.status, r.initiator, r.target_date])
        filename = "change_controls_export.csv"

    elif mod in ["audits", "audit"]:
        records = db.query(Audit).all()
        writer.writerow(["ID", "Audit Number", "Title", "Type", "Lead Auditor", "Status", "Critical", "Major", "Minor", "Target Date"])
        for r in records:
            writer.writerow([r.id, r.audit_number, r.title, r.audit_type, r.lead_auditor, r.status, r.findings_critical, r.findings_major, r.findings_minor, r.target_date])
        filename = "audits_export.csv"

    elif mod in ["documents", "document"]:
        records = db.query(QMSDocument).all()
        writer.writerow(["ID", "Document Number", "Title", "Category", "Version", "Department", "Status", "Author", "Effective Date"])
        for r in records:
            writer.writerow([r.id, r.doc_number, r.title, r.category, r.version, r.department, r.status, r.author, r.effective_date])
        filename = "documents_export.csv"

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export module: {module}")

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
