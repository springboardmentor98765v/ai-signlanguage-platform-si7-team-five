"""Small adapter owned by Intern 4; Intern 2 only needs to expose the endpoint below."""

import logging
import os

import httpx

logger = logging.getLogger(__name__)


def create_notification(user_id: int, event_type: str, title: str, message: str) -> None:
    """Notify through Intern 2's API without breaking a completed practice attempt.

    Set NOTIFICATION_SERVICE_URL to e.g. http://localhost:8000/notifications.
    The expected Intern 2 endpoint is POST {base}/ with the JSON payload below.
    """
    base_url = os.getenv("NOTIFICATION_SERVICE_URL", "http://127.0.0.1:8000/notifications")
    payload = {"user_id": user_id, "event_type": event_type, "title": title, "message": message}
    try:
        response = httpx.post(base_url.rstrip("/"), json=payload, timeout=3.0)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        # A notification outage must never lose the learner's assessed attempt.
        logger.warning("Could not create notification: %s", exc)
