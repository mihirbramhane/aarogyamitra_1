"""FastAPI backend for AarogyaMitra.

Endpoints:
  GET  /health                    -> liveness check
  POST /analyze                   -> kick off the 6-agent crew as a background job, returns job_id
  GET  /analyze/{job_id}/status   -> poll job progress / result
  POST /send-report               -> send the report via Twilio SMS/WhatsApp
"""
import json
import logging
import os
import sys
import tempfile
import uuid
from typing import Optional

# Windows' console defaults to the cp1252 codepage, which can't encode the
# emoji/Unicode characters CrewAI's verbose logger prints (or Hindi/other
# non-Latin guidance text) — that raises UnicodeEncodeError and crashes the
# whole background job mid-run. Force UTF-8 so any character can be printed.
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Some machines route all outbound HTTPS through an antivirus/corporate proxy
# that TLS-inspects with its own root CA (trusted by the OS, not by Python's
# bundled certifi CAs) — every requests/httpx call then fails with
# SSLCertVerificationError even though the OS and browsers trust it fine.
# truststore makes the ssl module defer to the OS trust store instead.
try:
    import truststore

    truststore.inject_into_ssl()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO)

from fastapi import BackgroundTasks, FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from pydantic import ValidationError

from app.config import get_settings
from app.jobs import create_job, get_job, run_job
from app.notify import send_message
from app.schemas import AnalyzeResponse, JobStatus, SendReportRequest, UserProfile

logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(title="AarogyaMitra API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


def _build_response(result) -> AnalyzeResponse:
    """Pull each task's structured (`output_pydantic`) output into a typed AnalyzeResponse.

    Task order (see app/tasks.py build_tasks): profile, scheme, coverage, hospital,
    document, voice.
    """
    outputs = result.tasks_output
    schemes = outputs[1].pydantic.items if outputs[1].pydantic else []
    coverage_out = outputs[2].pydantic
    coverage = coverage_out.summary if coverage_out else str(outputs[2])
    bill_amount = coverage_out.bill_amount if coverage_out else None
    coverage_status = coverage_out.coverage_status if coverage_out else "unknown"
    hospitals = outputs[3].pydantic.items if outputs[3].pydantic else []
    checklist = outputs[4].pydantic.checklist if outputs[4].pydantic else []
    voice_guidance = str(outputs[5])

    report_parts = ["## Matched Schemes"]
    for s in schemes:
        report_parts.append(f"- **{s.name}** ({s.authority}) — {s.coverage_amount or 'N/A'}: {s.why_eligible}")
    report_parts.append("\n## Coverage Summary\n" + coverage)
    report_parts.append("\n## Nearby Hospitals")
    for h in hospitals:
        report_parts.append(f"- {h.name} — {h.address}")
    report_parts.append("\n## Documents Needed")
    for d in checklist:
        report_parts.append(f"- {d}")
    report_parts.append("\n## Guidance\n" + voice_guidance)

    return AnalyzeResponse(
        matched_schemes=schemes,
        coverage_summary=coverage,
        bill_amount=bill_amount,
        coverage_status=coverage_status,
        nearby_hospitals=hospitals,
        document_checklist=checklist,
        voice_guidance=voice_guidance,
        raw_report="\n".join(report_parts),
    )


@app.post("/analyze")
async def analyze(
    background_tasks: BackgroundTasks,
    profile: str = Form(..., description="JSON string of UserProfile"),
    bill: Optional[UploadFile] = File(None),
) -> dict:
    """Kick off the crew in the background and return a job_id to poll.

    `profile` is a JSON string; `bill` is an optional PDF upload.
    """
    try:
        profile_dict = UserProfile.model_validate_json(profile).model_dump()
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid profile: {exc}") from exc

    bill_path = None
    if bill is not None:
        suffix = os.path.splitext(bill.filename or "bill.pdf")[1] or ".pdf"
        fd, bill_path = tempfile.mkstemp(prefix="bill_", suffix=suffix)
        with os.fdopen(fd, "wb") as f:
            f.write(await bill.read())

    job_id = str(uuid.uuid4())
    create_job(job_id)
    background_tasks.add_task(run_job, job_id, profile_dict, bill_path, _build_response)
    return {"job_id": job_id}


@app.get("/analyze/{job_id}/status", response_model=JobStatus)
def analyze_status(job_id: str) -> JobStatus:
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Unknown job_id")
    return job


@app.post("/send-report")
def send_report(req: SendReportRequest) -> dict:
    return send_message(req.phone_number, req.channel, req.report_text)
