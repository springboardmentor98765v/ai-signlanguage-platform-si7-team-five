# ai-signlanguage-platform-si7-team-five
The AI-Powered Sign Language Learning &amp; Assessment Platform is an intelligent educational system designed to help users learn and practice sign language using Artificial Intelligence and Computer Vision technologies.

## Local Milestone 3 run

Open three terminals from the project folders below.

```powershell
# Terminal 1 - Backend API, database, assessment, notifications, exports
cd Backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 - AI/CV prediction service
cd AIML_CV
python -m pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001

# Terminal 3 - React frontend
cd Frontend
npm install
npm run dev
```

Copy `Frontend/.env.example` to `Frontend/.env` if the local ports change. The frontend calls the backend on port 8000 and the AI service on port 8001 by default.
