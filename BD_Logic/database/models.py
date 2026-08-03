from sqlalchemy import Column, Integer, String, Float

from BD_Logic.database.connection import Base

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True)

    user_id = Column(Integer)

    # Keep DB column name as 'course_id' for compatibility, expose as `lesson_id`
    lesson_id = Column('course_id', Integer)

    expected_sign = Column(String)

    predicted_sign = Column(String)

    score = Column(Float)
    
