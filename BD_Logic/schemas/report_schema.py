from pydantic import BaseModel

class ReportRequest(BaseModel):
    user_id: int
    student_name: str
   