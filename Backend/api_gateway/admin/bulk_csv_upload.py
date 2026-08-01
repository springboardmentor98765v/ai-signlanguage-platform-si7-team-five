from fastapi import APIRouter
from services import csv_upload_service

router = APIRouter()

@router.post("/admin/lessons/bulk-upload")
def bulk_upload(file_path: str):
    return csv_upload_service.bulk_upload_lessons(file_path)
