"""
Generates a valid, readable PDF document for testing PDF text extraction.
"""
def create_sample_pdf(filename="samples/deviation_sample_03.pdf"):
    content = (
        "BT\n"
        "/F1 16 Tf\n"
        "50 720 Td\n"
        "(PHARMACEUTICAL DEVIATION REPORT - QA COMPLIANCE) Tj\n"
        "/F1 11 Tf\n"
        "0 -30 Td\n"
        "(Site / Plant: API Manufacturing Facility - Unit 1) Tj\n"
        "0 -20 Td\n"
        "(Date of Occurrence: 2026-09-24) Tj\n"
        "0 -20 Td\n"
        "(Source: Routine monitoring by operator) Tj\n"
        "0 -20 Td\n"
        "(Related Product: Active Pharmaceutical Ingredient (API) Bulk) Tj\n"
        "0 -20 Td\n"
        "(Batch / Lot Number: ABC-001) Tj\n"
        "0 -35 Td\n"
        "(INCIDENT DETAILS:) Tj\n"
        "0 -20 Td\n"
        "(During manufacturing of Batch ABC-001 on 24-Sep-2026, the temperature) Tj\n"
        "0 -16 Td\n"
        "(of Reactor R-101 exceeded the approved range of 75-80 C and reached 86 C) Tj\n"
        "0 -16 Td\n"
        "(for approximately 15 minutes. The event was identified by the production) Tj\n"
        "0 -16 Td\n"
        "(operator during routine monitoring.) Tj\n"
        "0 -30 Td\n"
        "(INITIAL CONTAINMENT ACTIONS:) Tj\n"
        "0 -20 Td\n"
        "(Reactor jacket cooling valve opened. Batch quarantined under QA Hold.) Tj\n"
        "ET\n"
    )
    stream_len = len(content)

    pdf_template = f"""%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 5 0 R
    >>
  >>
>>
endobj
4 0 obj
<<
  /Length {stream_len}
>>
stream
{content}endstream
endobj
5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000300 00000 n 
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
450
%%EOF"""

    with open(filename, "wb") as f:
        f.write(pdf_template.encode("latin-1"))

    print(f"Generated {filename}")

if __name__ == "__main__":
    create_sample_pdf()
