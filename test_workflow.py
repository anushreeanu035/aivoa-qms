import sys
import os

sys.path.insert(0, os.path.abspath("backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.document_parser import parse_document
from app.ai.graph import run_deviation_workflow

print("=== 1. TESTING DOCUMENT PARSER ===")
with open("samples/deviation_sample_02.docx", "rb") as f:
    docx_bytes = f.read()

parsed_text = parse_document(docx_bytes, "deviation_sample_02.docx")
print(f"Parsed DOCX length: {len(parsed_text)} chars")
print("Preview:", parsed_text[:140].replace("\n", " "))

print("\n=== 2. TESTING LANGGRAPH WITH DOCX BYTES ===")
graph_res = run_deviation_workflow(docx_bytes, "deviation_sample_02.docx")
print("Extracted Site:", graph_res.get("site"))
print("Extracted Batch:", graph_res.get("batch_lot_number"))
print("Initial Impact:", graph_res.get("initial_impact"))
print("Initial Severity:", graph_res.get("initial_severity"))
print("Severity Reason:", graph_res.get("severity_reason"))
print("Pipeline Steps:", len(graph_res.get("steps_executed")))

print("\n=== 3. TESTING FASTAPI ENDPOINTS VIA TESTCLIENT ===")
client = TestClient(app)

# Health endpoint
health_res = client.get("/api/health")
print("Health status code:", health_res.status_code, health_res.json())

# Analyze endpoint (pasted text)
sample_text = (
    "During manufacturing of Batch ABC-001 on 24-Sep-2026, the temperature of "
    "Reactor R-101 exceeded the approved range of 75–80°C and reached 86°C for approximately 15 minutes."
)
analyze_res = client.post("/api/deviations/analyze", data={"text": sample_text})
print("Analyze status code (text):", analyze_res.status_code)
assert analyze_res.status_code == 200
analyze_json = analyze_res.json()
print("Analyze success:", analyze_json["success"])
print("Auto-populated Title:", analyze_json["data"]["title"])
print("Auto-populated Batch:", analyze_json["data"]["batch_lot_number"])
print("Auto-populated Severity:", analyze_json["data"]["initial_severity"])

# Analyze endpoint (uploaded PDF file)
with open("samples/deviation_sample_03.pdf", "rb") as f_pdf:
    pdf_upload_res = client.post(
        "/api/deviations/analyze",
        files={"file": ("deviation_sample_03.pdf", f_pdf, "application/pdf")}
    )
print("Analyze status code (PDF upload):", pdf_upload_res.status_code)
assert pdf_upload_res.status_code == 200
pdf_json = pdf_upload_res.json()
print("PDF Upload Extracted Batch:", pdf_json["data"]["batch_lot_number"])
print("PDF Upload Extracted Severity:", pdf_json["data"]["initial_severity"])

# Save Deviation endpoint
save_payload = {
    "site": analyze_json["data"]["site"] or "API Manufacturing Plant",
    "date_of_occurrence": analyze_json["data"]["date_of_occurrence"] or "2026-09-24",
    "title": analyze_json["data"]["title"] or "Reactor Temperature Excursion",
    "source": "Routine monitoring",
    "related_product": "Active Pharmaceutical Ingredient (API)",
    "batch_lot_number": analyze_json["data"]["batch_lot_number"] or "ABC-001",
    "detailed_description": analyze_json["data"]["detailed_description"],
    "initial_impact": analyze_json["data"]["initial_impact"] or "Product Quality",
    "initial_severity": analyze_json["data"]["initial_severity"] or "Major",
    "severity_reason": analyze_json["data"]["severity_reason"],
    "status": "Draft",
    "ai_generated": True,
    "ai_confidence": 0.95
}
save_res = client.post("/api/deviations", json=save_payload)
print("Save status code:", save_res.status_code)
assert save_res.status_code == 201
saved_deviation = save_res.json()
print("Saved deviation ID:", saved_deviation["id"])

# Get all deviations
list_res = client.get("/api/deviations")
print("Deviations count in DB:", len(list_res.json()))

# Get deviation by ID
get_res = client.get(f"/api/deviations/{saved_deviation['id']}")
assert get_res.status_code == 200
print("Fetched saved deviation #", get_res.json()["id"])

# Chat endpoint
chat_res = client.post(
    "/api/deviations/chat",
    json={
        "message": "Why was Major severity recommended?",
        "deviation_context": saved_deviation
    }
)
print("Chat status code:", chat_res.status_code)
print("Chat AI response preview:", chat_res.json()["response"][:120])

print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")
