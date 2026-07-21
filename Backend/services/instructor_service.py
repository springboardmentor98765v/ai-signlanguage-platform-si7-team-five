from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

r = APIRouter()

class AssignStudentRequest(BaseModel):
    student_id: int
    instructor_id: int
    
@r.post("/assign-student")
def assign_student(request: AssignStudentRequest):
    # Placeholder logic for assigning a student to an instructor
    return {"message": f"Student {request.student_id} assigned to Instructor {request.instructor_id}"}

class StudentSummary(BaseModel):
    student_id: int
    name: str
    accuracy: float
    
@r.get("/students", response_model=List[StudentSummary])
def view_students(instructor_id: int):
    # Placeholder logic for retrieving students assigned to an instructor
    # In a real application, this would query a database
    dummy_students = [
        StudentSummary(student_id=1, name="Amala", accuracy=76.3),
        StudentSummary(student_id=2, name="Bharath", accuracy=83.8),
    ]
    return dummy_students
