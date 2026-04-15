import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional

class StudentCreate(BaseModel):
    student_code: str = Field(pattern=r"^\d{10}$")
    fullname: str
    gpa: float = Field(ge=0.1, le=4.0)
    department: Optional[str] = None 
    major: Optional[str] = None

    @field_validator("student_code")
    @classmethod
    def validate_student_code(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r"\d{10}", value):
            raise ValueError("MSSV phải gồm đúng 10 chữ số")
        return value

    @field_validator("fullname")
    @classmethod
    def validate_fullname(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Họ tên không được để trống")
        if any(ch.isdigit() for ch in value):
            raise ValueError("Họ tên không được chứa số")
        return value



class StudentResponse(BaseModel):
    id: int
    student_code: str
    fullname: str
    gpa: float
    department: Optional[str] = None
    major: Optional[str] = None

    class Config:
        from_attributes = True



