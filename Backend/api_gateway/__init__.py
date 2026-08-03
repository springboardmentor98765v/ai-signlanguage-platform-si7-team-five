# Aggregates all routers for easy import in main.py

from .admin.bulk_activate import router as bulk_activate_router
from .admin.bulk_csv_upload import router as bulk_csv_upload_router
from .admin.change_role import router as change_role_router
from .instructor.assign_student import router as assign_student_router
from .lessons.create_lessons import router as create_lesson_router
from .notifications.create_notifications import router as create_notification_router
from .notifications.list_notifications import router as list_notifications_router
from .notifications.mark_as_read import router as mark_as_read_router

routers = [
    assign_student_router,
    change_role_router,
    bulk_activate_router,
    bulk_csv_upload_router,
    create_lesson_router,
    create_notification_router,
    list_notifications_router,
    mark_as_read_router,
]

__all__ = ["routers"]
