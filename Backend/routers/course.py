from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.rbac import role_required
from db import get_db
from models.course import Course
from schemas.course import CourseCreate, CourseUpdate, CourseOut

r = APIRouter()


@r.post("", response_model=CourseOut)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    user=Depends(role_required("Instructor")),
):
    new_course = Course(**course.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course


@r.get("", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


@r.get("/{lesson_id}", response_model=CourseOut)
def get_course(lesson_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == lesson_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return course


@r.put("/{lesson_id}", response_model=CourseOut)
def update_course(
    lesson_id: int,
    course: CourseUpdate,
    db: Session = Depends(get_db),
    user=Depends(role_required("Instructor")),
):
    db_course = db.query(Course).filter(Course.id == lesson_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if course.title is not None:
        db_course.title = course.title
    if course.description is not None:
        db_course.description = course.description
    db.commit()
    db.refresh(db_course)
    return db_course


@r.delete("/{lesson_id}")
def delete_course(
    lesson_id: int,
    db: Session = Depends(get_db),
    user=Depends(role_required("Admin")),
):
    db_course = db.query(Course).filter(Course.id == lesson_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(db_course)
    db.commit()
    return {"message": "Lesson deleted"}
