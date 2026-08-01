import csv
from fastapi import HTTPException

LESSONS = []

def bulk_upload_lessons(file_path: str):
    try:
        with open(file_path, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                lesson = {
                    "lesson_id": len(LESSONS) + 1,
                    "title": row.get("title"),
                    "category": row.get("category"),
                    "difficulty": row.get("difficulty")
                }
                LESSONS.append(lesson)
        return {"message": f"{len(LESSONS)} lessons uploaded", "lessons": LESSONS}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV upload failed: {str(e)}")
