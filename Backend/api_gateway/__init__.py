# Aggregates all routers for easy import in main.py

from Backend.api_gateway.admin.bulk_activate import bulk_activate
from auth import login, register, update_profile, reset_password, change_password
from instructor import assign_student, view_students, progress_summary
from admin import list_users, activate_deactivate, change_role
from lessons import create_lesson, edit_lesson, delete_lesson, list_lessons, search_lessons
from notifications import create_notification, list_notifications, mark_as_read
from admin import bulk_csv_upload, bulk_activate

routers += [
    login.router,
    register.router,
    update_profile.router,
    reset_password.router,
    change_password.router,
    assign_student.router,
    view_students.router,
    progress_summary.router,
    list_users.router,
    activate_deactivate.router,
    change_role.router,
    create_lesson.router,
    edit_lesson.router,
    delete_lesson.router,
    list_lessons.router,
    search_lessons.router,
    create_notification.router,
    list_notifications.router,
    mark_as_read.router,
    bulk_activate.router,
    bulk_csv_upload.router
]
