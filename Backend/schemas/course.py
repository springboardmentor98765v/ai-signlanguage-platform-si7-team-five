from pydantic import BaseModel, ConfigDict


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

    model_config = ConfigDict(from_attributes=True)
