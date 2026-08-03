# =============================================================================
# DAY 4 - NOTIFICATION TRIGGERS
# Stores notifications created when a badge, certificate or recommendation event
# happens. The notification router exposes these records to the frontend bell.
# =============================================================================

from sqlalchemy.orm import Session

from models.business_logic import Notification


def create_notification_record(db: Session, user_id: int, event_type: str, title: str, message: str) -> Notification:
    """Persist an in-app notification inside the shared backend transaction."""
    row = Notification(user_id=user_id, event_type=event_type, title=title, message=message)
    db.add(row)
    return row
