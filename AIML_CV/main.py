import os
import sys

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(THIS_DIR, "src")
for path in (SRC_DIR, THIS_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

from src.main import *

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
