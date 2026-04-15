from sqlalchemy.orm import Session
from . import models, schemas


def get_student(db: Session, student_id: int):
    return db.query(models.Student).all()

def get_students(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Student).all()

def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(
        student_code=student.student_code,
        fullname=student.fullname,
        gpa=student.gpa
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

def get_teachers(db: Session):
    return db.query(models.Teacher).all()

def create_teacher(db: Session, teacher: schemas.TeacherCreate):
    db_teacher = models.Teacher(
        teacher_code=teacher.teacher_code,
        fullname=teacher.fullname,
        subject=teacher.subject
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher