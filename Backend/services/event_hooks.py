from services import notification_service

# Define supported events
EVENTS = {
    "badge_earned": "You earned a new badge!",
    "certificate_ready": "Your certificate is ready to download!",
    "new_recommendation": "A new lesson recommendation is available!"
}

def trigger_event(user_id: int, event_type: str):
    if event_type not in EVENTS:
        raise ValueError(f"Unsupported event type: {event_type}")
    message = EVENTS[event_type]
    return notification_service.create_notification(user_id, message)
