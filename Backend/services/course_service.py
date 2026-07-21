from fastapi import APIRouter, Query, HttpException 
from pydantic import BaseModel
from typing import List, Optional

r = APIRouter()

class Lesson(BaseModel):
    lesson_id: int
    title: str
    category: str
    difficulty: str
    
LESSONS = [
    Lesson(lesson_id=1, title="Letter A", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=2, title="Letter B", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=3, title="Letter C", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=4, title="Letter D", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=5, title="Letter E", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=6, title="Letter F", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=7, title="Letter G", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=8, title="Letter H", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=9, title="Letter I", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=10, title="Letter J", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=11, title="Letter K", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=12, title="Letter L", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=13, title="Letter M", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=14, title="Letter N", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=15, title="Letter O", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=16, title="Letter P", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=17, title="Letter Q", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=18, title="Letter R", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=19, title="Letter S", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=20, title="Letter T", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=21, title="Letter U", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=22, title="Letter V", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=23, title="Letter W", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=24, title="Letter X", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=25, title="Letter Y", category="Basics", difficulty="Beginner"),
    Lesson(lesson_id=26, title="Letter Z", category="Basics", difficulty="Beginner"),
    Lesson( lesson_id=27, title="Hello", category="Greetings", difficulty="Medium"),
    Lesson(lesson_id=28, title="Goodbye", category="Greetings", difficulty="Medium"),
    Lesson(lesson_id=29, title="Thank You", category="Greetings", difficulty="Medium"),
    Lesson(lesson_id=30, title="Please", category="Greetings", difficulty="Medium"),
    Lesson(lesson_id=31, title="Hello, my name is Amala", category="Intoduction", difficulty="Hard")
    ]   

@r.get("/courses", response_model=List[Lesson])
def list_lessons(page: int = 1, size: int = 10, category: Optional[str] = Query(None, description="Filter by category"), difficulty: Optional[str] = Query(None, description="Filter by difficulty")):
    filtered_lessons = LESSONS
    
    if category:
        filtered_lessons = [l for l in filtered_lessons if l.category.lower() == category.lower()]
    if difficulty:  
        filtered_lessons = [l for l in filtered_lessons if l.difficulty.lower() == difficulty.lower()]
    
    start = (page - 1) * size
    end = start + size
    return filtered_lessons[start:end]

@r.get("/courses/search", response_model=List[Lesson])
def search_lessons(query: str = Query(..., description="Search")):
    return [l for l in LESSONS if query.lower() in l.title.lower()]

@r.post("/lessons")

def create_lesson(request: Lesson, role: str = "Instructor"):
    if role not in ["Instructor", "Admin"]:
        raise HttpException(status_code=403, detail="Access Denied.")
    LESSONS.append(request.dict())
    return {"message": "Lesson created successfully."}
  
@r.put("/lessons/{lesson_id}")
def update_lesson(lesson_id: int, request: Lesson, role: str = "Instructor"):
    if role not in ["Instructor", "Admin"]:
        raise HttpException(status_code=403, detail="Access Denied.")
    for i, lesson in enumerate(LESSONS):
        if lesson.lesson_id == lesson_id:
            LESSONS[i] = request.dict()
            return {"message": "Lesson updated successfully."}
    raise HttpException(status_code=404, detail="Lesson not found.")
    
@r.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, role: str = "Instructor"):
    if role not in ["Instructor", "Admin"]:
        raise HttpException(status_code=403, detail="Access Denied.")
    for i, lesson in enumerate(LESSONS):
        if lesson.lesson_id == lesson_id:
            del LESSONS[i]
            return {"message": "Lesson deleted successfully."}
    raise HttpException(status_code=404, detail="Lesson not found.")  