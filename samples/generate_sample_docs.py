import os
from docx import Document

os.makedirs("samples", exist_ok=True)

# Generate sample DOCX
doc = Document()
doc.add_heading("PHARMACEUTICAL QUALITY INCIDENT REPORT", level=1)
doc.add_paragraph("Site / Facility: API Synthesis Unit 02")
doc.add_paragraph("Date of Occurrence: 2026-09-24")
doc.add_paragraph("Batch / Lot Number: ABC-001")
doc.add_paragraph("Product: Active Pharmaceutical Ingredient Intermediate")
doc.add_paragraph("Source: Routine monitoring by operations team")

doc.add_heading("Detailed Description", level=2)
doc.add_paragraph(
    "During manufacturing of Batch ABC-001 on 24-Sep-2026, the temperature of Reactor R-101 exceeded "
    "the approved range of 75–80°C and reached 86°C for approximately 15 minutes. "
    "The event was identified by the production operator during routine monitoring."
)

doc.add_heading("Immediate Containment Actions", level=2)
table = doc.add_table(rows=1, cols=2)
hdr_cells = table.rows[0].cells
hdr_cells[0].text = 'Action Item'
hdr_cells[1].text = 'Responsible'

row_cells = table.add_row().cells
row_cells[0].text = 'Batch quarantined in ERP under QA Hold'
row_cells[1].text = 'Production Supervisor'

row_cells2 = table.add_row().cells
row_cells2[0].text = 'Calibration check initiated for RTD Sensor TE-101'
row_cells2[1].text = 'Instrumentation Lead'

doc.save("samples/deviation_sample_02.docx")
print("Successfully generated samples/deviation_sample_02.docx")
