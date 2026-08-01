from pydantic import BaseModel
class ExportRequest(BaseModel):
    user_id: str
    student_name: str
    export_type: str