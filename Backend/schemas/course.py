from pydantic import BaseModel, ConfigDict


class CourseBase(BaseModel):
    title: str
    description: str
    instructor_id: str


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str  
    description: str 


class CourseOut(CourseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
