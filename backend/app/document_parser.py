import io
from fastapi import HTTPException, status
from pypdf import PdfReader
from docx import Document

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit

def parse_document(file_bytes: bytes, filename: str) -> str:
    """
    Extracts text content from uploaded PDF, DOCX, or TXT file.
    Validates file format, size, and content non-emptiness.
    """
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty. Please provide a valid document."
        )

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of 15MB ({len(file_bytes) / (1024 * 1024):.1f}MB detected)."
        )

    filename_lower = filename.lower()
    extracted_text = ""

    try:
        if filename_lower.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(file_bytes))
            if len(reader.pages) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The PDF file has no pages or is corrupt."
                )
            pages_text = []
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    pages_text.append(page_text.strip())
            extracted_text = "\n\n".join(pages_text)

        elif filename_lower.endswith(".docx"):
            doc = Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            
            # Also extract text from any tables in the docx
            for table in doc.tables:
                for row in table.rows:
                    row_data = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_data:
                        paragraphs.append(" | ".join(row_data))
                        
            extracted_text = "\n".join(paragraphs)

        elif filename_lower.endswith(".txt"):
            for encoding in ["utf-8", "latin-1", "windows-1252"]:
                try:
                    extracted_text = file_bytes.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
            if not extracted_text:
                extracted_text = file_bytes.decode("utf-8", errors="ignore")

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{filename}'. Supported formats are PDF (.pdf), Word (.docx), and Plain Text (.txt)."
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract text from {filename}: {str(e)}"
        )

    cleaned_text = extracted_text.strip()
    if not cleaned_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No readable text could be extracted from '{filename}'. Please verify the file contains selectable text rather than scanned images."
        )

    return cleaned_text
