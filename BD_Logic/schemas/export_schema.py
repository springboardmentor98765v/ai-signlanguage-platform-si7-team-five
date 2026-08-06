# INTERN 4 CHECKPOINT: Export Schema for Reports and Certificates
# This schema defines the request structure for export operations
# It supports multiple export formats with proper validation

from pydantic import BaseModel, Field
from typing import Literal

class ExportRequest(BaseModel):
    user_id: int = Field(..., description="User ID for the report")
    student_name: str = Field(..., description="Student name for the report filename")
    export_type: Literal["json", "csv", "pdf", "excel", "xlsx"] = Field(
        ..., 
        description="Export format: json, csv, pdf, excel, or xlsx"
    )