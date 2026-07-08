"""Assemble the crew and run it."""
from typing import Any, Callable, Optional

from crewai import Crew, Process

from app.agents import build_agents
from app.tasks import build_tasks


async def run_aarogyamitra(
    profile: dict,
    bill_path: str | None = None,
    task_callback: Optional[Callable] = None,
) -> Any:
    """Run the full 6-agent pipeline and return the full CrewOutput.

    `result.tasks_output` holds each task's TaskOutput in order (profile, scheme,
    coverage, hospital, document, voice), so callers can pull structured
    (`output_pydantic`) data per task instead of only the final task's text.
    """
    agents = build_agents()
    tasks = build_tasks(agents, profile, bill_path)

    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
        task_callback=task_callback,
    )
    result = await crew.kickoff_async()
    return result
