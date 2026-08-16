FROM python:3.12-slim

# System libraries MediaPipe needs at runtime (same ones we had to install
# manually in Codespaces during Milestone 1 - libgl1, libgles2, libegl1)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libgles2 \
    libegl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Only the runtime-necessary source files -- day1-8 scripts are development
# history (dataset building, training, experiments) and are not needed to
# serve predictions. See docs/MODEL_CARD.md for how the shipped model was built.
COPY src/__init__.py src/database.py src/main.py src/
COPY src/models/hand_landmarker.task src/models/knn_classifier_m3.joblib src/models/class_feature_stats_m3.joblib src/models/

EXPOSE 8001

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
