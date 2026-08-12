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
            # Skip empty rows
            if not row or not any(row.values()):
                continue
                
            title = row.get("title", "").strip()
            category = row.get("category", "").strip()
            difficulty = row.get("difficulty", "").strip()
            
            # Validate only if values are provided
            if title:
                title = validate_string(title, "Lesson title")
            if category:
                category = validate_string(category, "Lesson category")
            if difficulty:
                difficulty = validate_string(difficulty, "Lesson difficulty")
            
            lesson = {
                "lesson_id": len(LESSONS) + 1,
                "title": title or "Untitled Lesson",
                "category": category or "General",
                "difficulty": difficulty or "Beginner"
            }
            LESSONS.append(lesson)
        return {"message": f"{len(LESSONS)} lessons uploaded", "lessons": LESSONS}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV upload failed: {str(e)}")
