from pydantic import BaseModel

class ExportRequest(BaseModel):
    user_id: int
    student_name: str
    export_type: str