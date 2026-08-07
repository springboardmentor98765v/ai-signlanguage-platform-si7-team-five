import csv
import io
from fastapi import HTTPException, UploadFile
from utils.validation import validate_string
LESSONS = []

async def bulk_upload_lessons(file: UploadFile):
    try:
        contents = await file.read()
        csvfile = io.StringIO(contents.decode('utf-8'))
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = validate_string(row.get("title"), "Lesson title")
            category = validate_string(row.get("category"), "Lesson category")
            difficulty = validate_string(row.get("difficulty"), "Lesson difficulty")
            lesson = {
                "lesson_id": len(LESSONS) + 1,
                "title": title,
                "category": category,
                "difficulty": difficulty
            }
            LESSONS.append(lesson)
        return {"message": f"{len(LESSONS)} lessons uploaded", "lessons": LESSONS}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV upload failed: {str(e)}")
