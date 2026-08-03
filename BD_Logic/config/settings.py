from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data"

CERTIFICATE_PATH = BASE_DIR / "generated_certificates"

REPORT_PATH = BASE_DIR / "generated_reports"

DEFAULT_PASS_SCORE = 80

MAX_SCORE = 100