from fastapi import APIRouter, Depends,HTTPException
from services.rbac import role_required
from sqlalchemy.orm import Session
from database import get_db
from models.course import Course
from schemas.course import CourseCreate, CourseUpdate, CourseOut

r = APIRouter()

@r.post("/courses", response_model=CourseOut)
def create_course(course: CourseCreate, db: Session = Depends(get_db), user=Depends(role_required("Instructor"))):
    new_course = Course(**course.dict())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@r.get("/courses", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

@r.get("/courses/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@r.put("/courses/{id}", response_model=CourseOut)
def update_course(id: int, course: CourseUpdate, db: Session = Depends(get_db), user=Depends(role_required("Instructor"))):
    new_course = db.query(Course).filter(Course.id == id).first()
    if not new_course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.title:
        new_course.title = course.title
    if course.description:
        new_course.description = course.description
    db.commit()
    db.refresh(new_course)
    return new_course

@r.delete("/courses/{id}")
def delete_course(id: int, db: Session = Depends(get_db), user=Depends(role_required("Admin"))):
    new_course = db.query(Course).filter(Course.id == id).first()
    if not new_course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(new_course)
    db.commit()
    return {"message": "Course deleted"}