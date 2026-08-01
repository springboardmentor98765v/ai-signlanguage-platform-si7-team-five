from fastapi import APIRouter
from services import course_service

router = APIRouter()

@router.post("/lessons")
def create_lesson(title: str, category: str, difficulty: str, role: str = "Instructor"):
    return course_service.create_lesson(title, category, difficulty, role)
