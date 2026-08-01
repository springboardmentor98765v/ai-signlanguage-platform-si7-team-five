from fastapi import APIRouter
from services import instructor_service

router = APIRouter()

@router.post("/instructor/assign-student")
def assign_student(instructor_id: int, student_id: int):
    return instructor_service.assign_student(instructor_id, student_id)
