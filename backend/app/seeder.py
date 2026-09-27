from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import Deviation, CAPA, ChangeControl, Audit, QMSDocument

def seed_qms_data(db: Session):
    """
    Seeds initial realistic GMP data for CAPAs, Change Controls, Audits, and Documents
    if they are currently empty.
    """
    # 1. Seed CAPAs if empty
    if db.query(CAPA).count() == 0:
        capas = [
            CAPA(
                capa_number="CAPA-2026-001",
                deviation_id=1,
                title="Reactor R-101 Primary Temperature Sensor Recalibration & Redundancy",
                source_event="Deviation DEV-2026-001 (Thermal Excursion in Synthesis Unit 02)",
                root_cause="Aging RTD temperature probe drift coupled with delayed PID loop cycle damping under high exotherm.",
                corrective_action="Immediately replace RTD sensor PT-101A and recalibrate across 50°C-120°C range against traceable NIST standard.",
                preventive_action="Install dual-probe redundant voting logic in SCADA and institute quarterly sensor validation cycle in PM calendar.",
                assignee="Marcus Vance (Instrumentation Eng.)",
                target_due_date="2026-10-15",
                status="In Progress",
                effectiveness_check="Verify 30 consecutive synthesis batches maintain reactor temperature within ±0.5°C of target setpoint."
            ),
            CAPA(
                capa_number="CAPA-2026-002",
                deviation_id=2,
                title="HPLC Chromatography Baseline Drift & Column Degasser Failure Investigation",
                source_event="Deviation DEV-2026-002 (OOS Impurity Peak in Finished API Lot)",
                root_cause="Vacuum degasser membrane micro-perforation allowing dissolved micro-bubbles in mobile phase B.",
                corrective_action="Replaced HPLC degasser module and purged quaternary pump lines with 100% isopropanol.",
                preventive_action="Added daily helium sparge verification check and revised QC instrument prep standard operating procedure.",
                assignee="Elena Rostova (QC Analytical Lead)",
                target_due_date="2026-10-02",
                status="Effectiveness Check",
                effectiveness_check="Run 5 replicate system suitability injections daily for 14 days without baseline noise exceeding 0.05 mAU."
            ),
            CAPA(
                capa_number="CAPA-2026-003",
                deviation_id=3,
                title="Cleanroom ISO Class 7 Airlock Differential Pressure Alarm Failure",
                source_event="Deviation DEV-2026-003 (Airlock DP Drop below 12.5 Pa)",
                root_cause="HVAC secondary belt slip following scheduled mechanical overhaul without torque verification.",
                corrective_action="Adjusted motor drive pulley tension, retorqued belt tensioner, and verified magnehelic gauge differential at 17.5 Pa.",
                preventive_action="Update HVAC Maintenance Protocol to mandate dual-signoff belt deflection gauge measurement.",
                assignee="David Kalu (Facilities / HVAC Mgr.)",
                target_due_date="2026-09-30",
                status="Closed",
                effectiveness_check="Differential pressure continuously logged without alarm for 60 calendar days."
            ),
            CAPA(
                capa_number="CAPA-2026-004",
                deviation_id=None,
                title="Secondary Packaging Optical Character Recognition (OCR) False Rejects",
                source_event="Packaging Line 3 Production Hold",
                root_cause="Ambient lighting fluctuations from newly installed ceiling LED fixtures interfering with vision sensor threshold.",
                corrective_action="Enclose camera inspection tunnel with non-reflective shroud and calibrate fixed illumination ring.",
                preventive_action="Establish line qualification criteria for any future packaging bay luminaire modifications.",
                assignee="Sarah Jenkins (Packaging Engineer)",
                target_due_date="2026-11-10",
                status="Open",
                effectiveness_check="Review vision system rejection rate over 10 consecutive packaging commercial runs."
            )
        ]
        db.add_all(capas)
        db.commit()

    # 2. Seed Change Controls if empty
    if db.query(ChangeControl).count() == 0:
        change_controls = [
            ChangeControl(
                cc_number="CC-2026-015",
                title="Installation of Automated Tri-Clamp Sanitary Ball Valves on Solvent Transfer Header",
                change_type="Equipment",
                impact_level="Major (Level 1)",
                description="Replace manual quarter-turn ball valves with automated pneumatically actuated sanitary valves tied to DCS.",
                justification="Eliminate manual operator intervention during flammable solvent charging, reducing VOC exposure and human valve line-up error.",
                regulatory_impact=True,
                status="Approved",
                initiator="Robert Chen (Process Automation)",
                target_date="2026-11-30"
            ),
            ChangeControl(
                cc_number="CC-2026-018",
                title="Optimization of Recrystallization Cooling Ramp for API Substance P-90",
                change_type="Process",
                impact_level="Major (Level 1)",
                description="Modify the controlled cooling ramp from -0.8°C/min to -0.5°C/min between 65°C and 35°C in Step 4 crystallizer.",
                justification="Consistently yields narrower crystal size distribution (d90 < 45 μm), eliminating downstream micronization bottlenecks.",
                regulatory_impact=True,
                status="Under Review",
                initiator="Dr. Alistair Finch (R&D Tech Transfer)",
                target_date="2026-12-15"
            ),
            ChangeControl(
                cc_number="CC-2026-021",
                title="Implementation of Electronic Logbook System (e-Log) for Cleanroom Suite 04",
                change_type="Document",
                impact_level="Moderate (Level 2)",
                description="Transition physical paper cleaning and equipment use logbooks to validated Part 11 compliant e-Log system.",
                justification="Streamline concurrent review, prevent missing log entries, and enforce timestamped biometric signoffs.",
                regulatory_impact=False,
                status="Implemented",
                initiator="Priya Sharma (QA Systems Specialist)",
                target_date="2026-10-20"
            ),
            ChangeControl(
                cc_number="CC-2026-024",
                title="HEPA Filter Replacement in Milling & Micronization Suite",
                change_type="Facility",
                impact_level="Moderate (Level 2)",
                description="Scheduled replacement of 4 ceiling terminal H14 HEPA filter units reaching terminal differential pressure limit.",
                justification="Routine preventative lifecycle replacement to ensure ISO Class 5 air cleanliness over active powder feed hoppers.",
                regulatory_impact=False,
                status="Under Review",
                initiator="David Kalu (Facilities / HVAC Mgr.)",
                target_date="2026-10-31"
            )
        ]
        db.add_all(change_controls)
        db.commit()

    # 3. Seed Audits if empty
    if db.query(Audit).count() == 0:
        audits = [
            Audit(
                audit_number="AUD-2026-001",
                title="Annual Comprehensive GMP Self-Inspection - API Synthesis Unit 02",
                audit_type="Internal Self-Inspection",
                lead_auditor="Rachel Adams (Lead Quality Auditor)",
                target_date="2026-09-18",
                status="Report Issued",
                findings_critical=0,
                findings_major=1,
                findings_minor=3,
                summary="Overall compliance is robust. One major finding issued regarding overdue calibration on auxiliary solvent chiller temperature transmitter TT-402. Minor findings addressed gowning room cleaning records and material container label placement."
            ),
            Audit(
                audit_number="AUD-2026-002",
                title="US FDA Pre-Approval Inspection (PAI) Mock Audit for API Product Line B",
                audit_type="Regulatory",
                lead_auditor="Dr. Michael Vance (External Regulatory Auditor)",
                target_date="2026-10-24",
                status="Scheduled",
                findings_critical=0,
                findings_major=0,
                findings_minor=0,
                summary="Full mock inspection covering Quality, Facilities & Equipment, Materials, Production, Packaging & Labeling, and Laboratory Control systems ahead of upcoming FDA agency inspection."
            ),
            Audit(
                audit_number="AUD-2026-003",
                title="Critical Raw Material Supplier Quality Audit - Apex Solvents Ltd.",
                audit_type="Supplier",
                lead_auditor="Anushree S. (Lead QA Specialist)",
                target_date="2026-08-14",
                status="Closed",
                findings_critical=0,
                findings_major=0,
                findings_minor=2,
                summary="Supplier passed cGMP vendor qualification for pharmaceutical grade Dimethylformamide (DMF) and Acetone. Supplier CAPAs accepted and closed."
            ),
            Audit(
                audit_number="AUD-2026-004",
                title="Quality Control Testing Laboratory Data Integrity & Part 11 Audit",
                audit_type="Internal Self-Inspection",
                lead_auditor="Jonathan Croft (Senior IT/QA Auditor)",
                target_date="2026-11-05",
                status="Scheduled",
                findings_critical=0,
                findings_major=0,
                findings_minor=0,
                summary="Targeted assessment of CDS (Chromatography Data System) user privileges, audit trail review compliance, backup retention, and system date/time protection."
            )
        ]
        db.add_all(audits)
        db.commit()

    # 4. Seed Documents if empty
    if db.query(QMSDocument).count() == 0:
        documents = [
            QMSDocument(
                doc_number="SOP-QA-001",
                title="Management and Investigation of Pharmaceutical Quality Deviations",
                category="SOP",
                version="4.2",
                department="Quality Assurance",
                effective_date="2026-01-15",
                review_date="2027-01-15",
                status="Effective",
                author="Anushree S. (Lead QA Specialist)",
                summary="Defines mandatory procedural requirements for reporting, categorizing (Minor/Major/Critical), investigating root cause (5 Whys, Fishbone), and approving quality deviations under ICH Q10.",
                content="Standard operating procedure detailing roles, QA triage timelines (24-hour notification, 30-day investigation closure), impact evaluation, cross-functional signoffs, and QP notification protocols."
            ),
            QMSDocument(
                doc_number="SOP-QA-008",
                title="Corrective and Preventive Action (CAPA) Program & Effectiveness Verification",
                category="SOP",
                version="3.0",
                department="Quality Assurance",
                effective_date="2026-02-01",
                review_date="2027-02-01",
                status="Effective",
                author="Rachel Adams (Lead Quality Auditor)",
                summary="Establishes lifecycle management for CAPAs originating from deviations, audits, trending, or customer complaints.",
                content="Mandates measurable success criteria for effectiveness verification, risk-based priority assignment, and quarterly Quality Management Review (QMR) reporting."
            ),
            QMSDocument(
                doc_number="SOP-PR-014",
                title="Operation, Cleaning, and In-Process Control of Reactor R-101",
                category="SOP",
                version="5.1",
                department="Production",
                effective_date="2025-11-10",
                review_date="2026-11-10",
                status="Effective",
                author="Marcus Vance (Production Supervisor)",
                summary="Step-by-step operating guidelines for API Synthesis Reactor R-101 including nitrogen inertion, agitation, thermal ramp profiles, and clean-in-place (CIP) validation.",
                content="Covers pre-batch line clearance, sensor zero-checks, emergency cooling interlocks, sampling port sterilization, and TOC swab acceptance limits (< 10 ppm)."
            ),
            QMSDocument(
                doc_number="SPEC-QC-109",
                title="Finished Active Pharmaceutical Ingredient Analytical Release Specification",
                category="Specification",
                version="2.0",
                department="Quality Control",
                effective_date="2026-03-01",
                review_date="2027-03-01",
                status="Effective",
                author="Elena Rostova (QC Analytical Lead)",
                summary="Defines compendial (USP/Ph. Eur.) specifications for chemical purity (HPLC > 99.5%), residual solvents, heavy metals, microbial limits, and polymorphic form.",
                content="Outlines validated test method references, analytical acceptance criteria, out-of-specification (OOS) retesting pathways, and certificate of analysis (CoA) requirements."
            ),
            QMSDocument(
                doc_number="POL-QA-005",
                title="Electronic Records and Signatures Compliance Policy (21 CFR Part 11 / EU Annex 11)",
                category="Policy",
                version="2.1",
                department="Quality Assurance",
                effective_date="2025-08-20",
                review_date="2026-08-20",
                status="Effective",
                author="Jonathan Croft (Senior IT/QA Auditor)",
                summary="Corporate standard enforcing data integrity, ALCOA+ principles, audit trails, password complexity, and computerized system validation (CSV) across all digital QMS platforms.",
                content="Details system validation requirements, immutable audit logging, unique credentialing, dual-factor authorization for critical disposition decisions, and disaster recovery validation."
            ),
            QMSDocument(
                doc_number="BMR-API-101",
                title="Master Batch Manufacturing Record - Active Pharmaceutical Intermediate Lot Synthesis",
                category="Batch Record",
                version="3.3",
                department="Production",
                effective_date="2026-04-12",
                review_date="2027-04-12",
                status="Effective",
                author="Dr. Alistair Finch (Process Chemistry)",
                summary="Controlled master execution record detailing raw material dispensing, stoichiometric ratios, agitation rates, crystallization parameters, and yield reconciliation.",
                content="Includes real-time critical process parameter (CPP) recording sheets, in-process testing signoffs, packaging inspection checklists, and QA batch release disposition."
            )
        ]
        db.add_all(documents)
        db.commit()
