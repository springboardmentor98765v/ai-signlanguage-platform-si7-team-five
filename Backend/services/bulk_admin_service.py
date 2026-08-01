from fastapi import HTTPException

USERS = [
    {"user_id": 1, "name": "Alice", "active": True},
    {"user_id": 2, "name": "Bob", "active": False},
    {"user_id": 3, "name": "Charlie", "active": True},
]

def bulk_activate_deactivate(user_ids: list[int], active: bool):
    updated = []
    for u in USERS:
        if u["user_id"] in user_ids:
            u["active"] = active
            updated.append(u)
    if not updated:
        raise HTTPException(status_code=404, detail="No users found to update")
    return {"message": f"{len(updated)} users updated", "users": updated}
