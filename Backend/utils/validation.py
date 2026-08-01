import re
from fastapi import HTTPException

def validate_string(value: str, field_name: str, max_length: int = 100):
    if not value or not isinstance(value, str):
        raise HTTPException(status_code=400, detail=f"{field_name} must be a non-empty string")
    if len(value) > max_length:
        raise HTTPException(status_code=400, detail=f"{field_name} too long (max {max_length} chars)")
    # Reject script tags or SQL-like input
    if re.search(r"<script>|SELECT|DROP|INSERT|--", value, re.IGNORECASE):
        raise HTTPException(status_code=400, detail=f"{field_name} contains invalid characters")
    return value

def validate_ids(ids: list[int], field_name: str = "IDs"):
    if not ids or not all(isinstance(i, int) for i in ids):
        raise HTTPException(status_code=400, detail=f"{field_name} must be a list of integers")
    return ids
