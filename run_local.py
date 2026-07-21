import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "Backend"
FRONTEND_DIR = ROOT / "Frontend"
AIML_DIR = ROOT / "AIML_CV"


def run_process(command, cwd, name):
    print(f"Starting {name} in {cwd}")
    return subprocess.Popen(
        command,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )


if __name__ == "__main__":
    backend = run_process([sys.executable, "main.py"], BACKEND_DIR, "backend")
    time.sleep(3)
    ai = run_process([sys.executable, "src/main.py"], AIML_DIR, "aiml")
    time.sleep(3)
    frontend = run_process(["npm", "run", "dev"], FRONTEND_DIR, "frontend")

    try:
        for proc in (backend, ai, frontend):
            proc.wait()
    except KeyboardInterrupt:
        for proc in (backend, ai, frontend):
            if proc.poll() is None:
                proc.terminate()
                proc.wait()
