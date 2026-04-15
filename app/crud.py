from sqlalchemy.orm import Session
from . import models, schemas


def get_student(db: Session, student_id: int):

    return db.query(models.Student).all()

def get_students(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Student).all()

    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_students(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Student).offset(skip).limit(limit).all()


def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(
        student_code=student.student_code,
        fullname=student.fullname,
        gpa=student.gpa,
        department=student.department,
        major=student.major
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if db_student:
        db.delete(db_student)
        db.commit()
        return True
    return False

def update_student(db: Session, student_id: int, student_data: schemas.StudentCreate):
    db_student = db.query(models.Student).filter (models.Student.id == student_id).first()
    if db_student:
        db_student.student_code = student_data.student_code
        db_student.fullname = student_data.fullname
        db_student.gpa = student_data.gpa
        db_student.department = student_data.department
        db_student.major = student_data.major 
        db.commit()
        db.refresh(db_student)
        return db_student
    return None