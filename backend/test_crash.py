from app.jobs import run_job
from app.schemas import UserProfile
import traceback

def dummy_callback(result):
    print("Callback called!")

if __name__ == "__main__":
    profile = {
        "state": "Telangana",
        "language": "en",
        "annual_income": 100000,
        "family_size": 4,
        "has_ration_card": True
    }
    print("Starting test job...")
    try:
        run_job("test_job", profile, None, dummy_callback)
        print("Job finished successfully.")
    except Exception as e:
        print("Job failed with Python exception:")
        traceback.print_exc()
