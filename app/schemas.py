from pydantic import BaseModel
from typing import Optional

class StudentCreate(BaseModel):
    student_code: str
    fullname: str
    gpa: float



class StudentResponse(StudentCreate):
    id: int

    class Config:
        from_attributes = True



