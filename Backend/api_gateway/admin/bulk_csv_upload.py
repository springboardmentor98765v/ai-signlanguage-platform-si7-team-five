from fastapi import APIRouter, UploadFile, File
from services import csv_upload_service

router = APIRouter(include_in_schema=False)

@router.post("/admin/lessons/bulk-upload")
async def bulk_upload(file: UploadFile = File(...)):
    """Upload CSV file for bulk lesson creation"""
    return await csv_upload_service.bulk_upload_lessons(file)
