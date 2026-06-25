from __future__ import annotations

from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter

from app.main import STORE, app


client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_store() -> None:
    STORE.clear()


def _text_pdf_bytes() -> bytes:
    text = (
        "John Doe Software Engineer Email john@example.com Phone 1234567890. "
        "Summary Software engineer focused on backend services. "
        "Skills Python FastAPI React SQL Docker. "
        "Projects CV Verdict GitHub https://github.com/example/cv-verdict. "
        "Built API endpoints, improved processing by 30 percent, and documented deployment. "
        "Experience Backend Intern 2023 Developed services and tested reports. "
        "Education Computer Science 2024."
    )
    stream = f"BT /F1 12 Tf 72 720 Td ({text}) Tj ET".encode("ascii")
    objects = [
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n",
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n",
        b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n",
        b"4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n",
        b"5 0 obj<</Length " + str(len(stream)).encode("ascii") + b">>stream\n" + stream + b"\nendstream endobj\n",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)
    startxref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(f"trailer<</Size {len(objects) + 1}/Root 1 0 R>>\nstartxref\n{startxref}\n%%EOF".encode("ascii"))
    return bytes(pdf)


def _blank_pdf_bytes() -> bytes:
    buffer = BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    writer.write(buffer)
    return buffer.getvalue()


def _post_analysis(**fields: str):
    data = {
        "language": fields.pop("language", "en"),
        "report_type": fields.pop("report_type", "medium"),
        "experience_level": fields.pop("experience_level", "entry_level"),
        **fields,
    }
    return client.post(
        "/api/analysis",
        data=data,
        files={"cv_file": ("cv.pdf", _text_pdf_bytes(), "application/pdf")},
    )


def _create_report(**fields: str) -> dict:
    response = _post_analysis(**fields)
    assert response.status_code == 200, response.text
    request_id = response.json()["request_id"]
    report_response = client.get(f"/api/analysis/{request_id}/report")
    assert report_response.status_code == 200, report_response.text
    return report_response.json()


def test_health_check() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_post_analysis_with_text_pdf() -> None:
    response = _post_analysis(target_role="Software Engineer")

    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["request_id"].startswith("req_")


def test_rejects_non_pdf() -> None:
    response = client.post(
        "/api/analysis",
        data={"language": "en", "report_type": "short", "experience_level": "student"},
        files={"cv_file": ("cv.txt", b"not a pdf", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "INVALID_FILE_TYPE"


def test_rejects_file_larger_than_5mb() -> None:
    response = client.post(
        "/api/analysis",
        data={"language": "en", "report_type": "short", "experience_level": "student"},
        files={"cv_file": ("large.pdf", b"0" * (5 * 1024 * 1024 + 1), "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "FILE_TOO_LARGE"


def test_rejects_pdf_without_readable_text() -> None:
    response = client.post(
        "/api/analysis",
        data={"language": "en", "report_type": "short", "experience_level": "student"},
        files={"cv_file": ("blank.pdf", _blank_pdf_bytes(), "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "NO_EXTRACTABLE_TEXT"


def test_status_report_and_delete_analysis() -> None:
    created = _post_analysis(target_role="Software Engineer")
    request_id = created.json()["request_id"]

    status = client.get(f"/api/analysis/{request_id}/status")
    report = client.get(f"/api/analysis/{request_id}/report")
    deleted = client.delete(f"/api/analysis/{request_id}")
    after_delete = client.get(f"/api/analysis/{request_id}/status")

    assert status.status_code == 200
    assert status.json()["status"] == "completed"
    assert report.status_code == 200
    assert report.json()["request_id"] == request_id
    assert deleted.status_code == 200
    assert deleted.json() == {"deleted": True}
    assert after_delete.status_code == 404


@pytest.mark.parametrize(
    ("fields", "expected_mode"),
    [
        ({}, "generic"),
        ({"target_role": "Software Engineer"}, "role_only"),
        ({"target_role": "Software Engineer", "job_description": "FastAPI SQL Docker testing"}, "targeted"),
    ],
)
def test_analysis_modes(fields: dict[str, str], expected_mode: str) -> None:
    report = _create_report(**fields)

    assert report["metadata"]["analysis_mode"] == expected_mode


@pytest.mark.parametrize("report_type", ["short", "medium"])
def test_report_types(report_type: str) -> None:
    report = _create_report(report_type=report_type, target_role="Software Engineer")

    assert report["report_type"] == report_type
    assert 0 <= report["score"]["final_score"] <= 100
    assert report["score"]["main_score"] <= 60
    assert report["score"]["internal_score"] <= 40


@pytest.mark.parametrize("language", ["ar", "en"])
def test_report_languages(language: str) -> None:
    report = _create_report(language=language, report_type="short", target_role="Software Engineer")

    assert report["language"] == language
    assert report["executive_judgment"]
    assert report["decision"]
