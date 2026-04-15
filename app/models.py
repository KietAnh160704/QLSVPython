from sqlalchemy import Column, Integer, String, Float
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String, unique=True, index=True) 
    fullname = Column(String)
    gpa = Column(Float)
    
class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    teacher_code = Column(String, unique=True, index=True)
    fullname = Column(String)
    subject = Column(String)