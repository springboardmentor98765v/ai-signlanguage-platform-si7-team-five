from sqlalchemy import Column, Integer, String, Float

from BD_Logic.database.connection import Base

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True)

    user_id = Column(Integer)

    course_id = Column(Integer)

    expected_sign = Column(String)

    predicted_sign = Column(String)

    score = Column(Float)
    
