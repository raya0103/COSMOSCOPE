"""
Tests for COSMOSCOPE Complete Interactive User Guide & Tutorial PDF Generator.
Validates PDF byte generation, ReportLab Platypus compilation, chapter coverage,
and FastAPI download routes.
"""

import os
import sys
import pytest

# Ensure backend directory is in python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.reports.tutorial_pdf import generate_tutorial_pdf

client = TestClient(app)

def test_tutorial_pdf_generation():
    """Verify that generate_tutorial_pdf compiles a valid multi-page A4 PDF."""
    pdf_bytes = generate_tutorial_pdf()
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 20000, "PDF size should be at least 20 KB"
    assert pdf_bytes.startswith(b"%PDF-"), "File must start with standard PDF header"
    assert b"COSMOSCOPE" in pdf_bytes
    assert b"SPHEREx" in pdf_bytes

def test_tutorial_pdf_chapter_coverage():
    """Ensure that all 16 chapters are compiled into the PDF."""
    pdf_bytes = generate_tutorial_pdf()
    for ch_num in range(1, 17):
        assert f"Chapter {ch_num}".encode() in pdf_bytes, f"Chapter {ch_num} must be present in the PDF"

def test_tutorial_download_endpoint():
    """Test GET /api/tutorial/download returns valid downloadable PDF with correct headers."""
    response = client.get("/api/tutorial/download")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'filename="COSMOSCOPE_Complete_User_Guide.pdf"' in response.headers.get("content-disposition", "")
    assert len(response.content) > 20000
    assert response.content.startswith(b"%PDF-")

def test_tutorial_info_endpoint():
    """Test GET /api/tutorial/info returns metadata and 16 chapters."""
    response = client.get("/api/tutorial/info")
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "COSMOSCOPE_Complete_User_Guide.pdf"
    assert data["chapters_count"] == 16
    assert len(data["topics"]) == 16
