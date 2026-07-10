from sqlalchemy import Column, Integer, String, Text
from database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructor_id = Column(Integer, nullable=False)  