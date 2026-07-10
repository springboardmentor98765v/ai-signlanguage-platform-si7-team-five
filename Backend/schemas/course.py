from pydantic import BaseModel

class CourseBase(BaseModel):
    title: str
    description: str
    instructor_id: int
class CourseCreate(CourseBase):    
    pass

class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    
class CourseOut(CourseBase):
    id: int

    class Config:
        orm_mode = True    