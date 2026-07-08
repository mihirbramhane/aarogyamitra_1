"""Tasks executed sequentially; each task's output feeds the next agent's context."""
from crewai import Task

from app.schemas import CoverageSummaryOutput, DocumentChecklistOutput, HospitalList, SchemeList


def build_tasks(agents: dict, profile: dict, bill_path: str | None) -> list:
    profile_str = ", ".join(f"{k}={v}" for k, v in profile.items())
    bill_line = f"An uploaded bill PDF is at: {bill_path}" if bill_path else "No bill uploaded."

    profile_task = Task(
        description=(
            f"Build a clean eligibility profile from this input: {profile_str}. "
            "List state, annual income, family size, ration card status and ailment. "
            "Do not assume missing values — mark them as unknown."
        ),
        expected_output="A concise structured eligibility profile.",
        agent=agents["eligibility_profiler"],
    )

    scheme_task = Task(
        description=(
            "Using the scheme_matcher tool with the user's state, income and ration "
            "card, list every scheme they qualify for. For each: name, authority, "
            "coverage amount, and one line on why they are eligible. Return the tool's "
            "results as-is in the required structured shape — do not invent schemes "
            "beyond what the tool returned."
        ),
        expected_output=(
            "A JSON object with an 'items' list; each item has name, authority, "
            "coverage_amount and why_eligible, matching the SchemeList schema."
        ),
        agent=agents["scheme_matcher"],
        context=[profile_task],
        output_pydantic=SchemeList,
    )

    coverage_task = Task(
        description=(
            f"{bill_line} If a bill exists, parse it with bill_parser and extract the "
            "total bill amount exactly as written (e.g. '₹45,000'); if no bill was "
            "uploaded or no total can be found, leave bill_amount null. Then, for the "
            "top matched scheme and the user's ailment, use coverage_retriever to pull "
            "the exact clauses on coverage, caps and exclusions. Summarise what will be "
            "paid, what won't, and cite the clause for each claim. Finally set "
            "coverage_status to 'full' if the scheme clearly covers the whole "
            "bill/ailment, 'partial' if it covers only part or has caps/exclusions "
            "leaving a gap, 'none' if the scheme does not cover this ailment/bill at "
            "all, or 'unknown' if there isn't enough information (e.g. no bill was "
            "uploaded) to judge."
        ),
        expected_output=(
            "A JSON object with 'summary' (the coverage summary grounded in retrieved "
            "scheme clauses), 'bill_amount' (string or null) and 'coverage_status' "
            "('full'|'partial'|'none'|'unknown'), matching the CoverageSummaryOutput schema."
        ),
        agent=agents["coverage_analyst"],
        context=[profile_task, scheme_task],
        output_pydantic=CoverageSummaryOutput,
    )

    hospital_task = Task(
        description=(
            "Use hospital_finder to list nearby hospitals where the top matched scheme's "
            "cashless treatment likely applies, based on the user's state/location and ailment. "
            "Return the tool's results as-is in the required structured shape — do not invent "
            "hospitals or coordinates beyond what the tool returned. If the tool returns an "
            "empty list, your output MUST also have an empty 'items' list — under no "
            "circumstances invent placeholder hospitals (e.g. generic names/addresses) to fill it."
        ),
        expected_output=(
            "A JSON object with an 'items' list; each item has name, address, "
            "latitude, longitude, phone and distance_note, matching the HospitalList schema."
        ),
        agent=agents["hospital_finder"],
        context=[profile_task, scheme_task],
        output_pydantic=HospitalList,
    )

    document_task = Task(
        description=(
            "Use document_generator for the top matched scheme to produce the document "
            "checklist and a pre-filled application draft. Add any scheme-specific "
            "documents you found in the coverage clauses."
        ),
        expected_output=(
            "A JSON object with 'checklist' (list of document strings) and 'draft_path', "
            "matching the DocumentChecklistOutput schema."
        ),
        agent=agents["document_agent"],
        context=[scheme_task, coverage_task],
        output_pydantic=DocumentChecklistOutput,
    )

    lang_code = profile.get("language", "en")
    lang_names = {"en": "English", "hi": "Hindi", "te": "Telugu", "ta": "Tamil", "bn": "Bengali", "mr": "Marathi"}
    lang_name = lang_names.get(lang_code, lang_code)

    voice_task = Task(
        description=(
            "Write a short, warm, plain-language summary for the user: which scheme to "
            "use, roughly how much it covers, which hospital to go to, and which papers "
            f"to carry. The user's chosen language is **{lang_name}** (code: {lang_code}). "
            f"You MUST use the translator tool with language='{lang_code}' to render the "
            f"entire response in {lang_name}. Do NOT use any other language. "
            "End with a gentle reminder to confirm details at the hospital / official portal."
        ),
        expected_output=f"Final guidance in {lang_name}, ready to be read aloud.",
        agent=agents["voice_guide"],
        context=[scheme_task, coverage_task, hospital_task, document_task],
    )

    return [profile_task, scheme_task, coverage_task, hospital_task, document_task, voice_task]

