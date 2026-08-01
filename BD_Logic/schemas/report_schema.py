from pydantic import BaseModel

class ReportRequest(BaseModel):
    user_id: str
    student_name: str
   