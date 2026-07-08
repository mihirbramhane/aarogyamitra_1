"""In-memory job store for the async /analyze flow.

NOTE: this dict lives in a single process's memory. It works fine for one
`uvicorn` worker (the default `--reload` dev command), but will NOT work if you
ever run with `--workers > 1` or multiple processes — each worker has its own
copy, so a status poll can 404 if it lands on a different worker than the one
running the job. If this needs to scale beyond one worker, swap this for Redis
(or similar shared store) keeping the same get/set shape.
"""
import logging
import traceback
from typing import Optional

from app.schemas import AnalyzeResponse, JobStatus

logger = logging.getLogger(__name__)

# Mirrors the agent order in app/tasks.py build_tasks (profile task has no
# user-visible "step" of its own here since scheme/hospital/etc. are what the
# frontend pipeline shows).
STEP_NAMES = [
    "Eligibility Profiler",
    "Scheme Matcher",
    "Coverage Analyst",
    "Hospital Finder",
    "Document Agent",
    "Voice Guide",
]

_JOBS: dict[str, JobStatus] = {}


def create_job(job_id: str) -> None:
    _JOBS[job_id] = JobStatus(status="running", step_index=0, step_name=STEP_NAMES[0])


def get_job(job_id: str) -> Optional[JobStatus]:
    return _JOBS.get(job_id)


def make_task_callback(job_id: str):
    """Returns a CrewAI `task_callback` that advances this job's step on each
    completed task. Fires once per task, in task order, so a simple counter
    closed over here is enough regardless of exact TaskOutput field names.
    """
    counter = {"i": 0}

    def _callback(output) -> None:
        counter["i"] += 1
        job = _JOBS.get(job_id)
        if job is None:
            return
        idx = min(counter["i"], len(STEP_NAMES) - 1)
        agent_name = getattr(output, "agent", None) or STEP_NAMES[idx]
        job.step_index = idx
        job.step_name = agent_name

    return _callback


async def run_job(job_id: str, profile_dict: dict, bill_path: str | None, build_response) -> None:
    from app.crew import run_aarogyamitra  # local import avoids a circular import with main.py

    job = _JOBS[job_id]
    try:
        result = await run_aarogyamitra(
            profile_dict, bill_path, task_callback=make_task_callback(job_id)
        )
        job.result = build_response(result)
        job.status = "done"
        job.step_index = len(STEP_NAMES) - 1
        job.step_name = STEP_NAMES[-1]
    except Exception as exc:  # never let a background task fail silently
        logger.error("Job %s failed:\n%s", job_id, traceback.format_exc())
        job.status = "error"
        job.error = f"Analysis failed: {exc}"
