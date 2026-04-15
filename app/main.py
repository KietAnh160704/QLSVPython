from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.exc import DatabaseError
from sqlalchemy.orm import Session
from datetime import datetime
from pathlib import Path
import os

from . import models, schemas, crud
from .database import engine, SessionLocal


DATABASE_FILE = Path("student_management.db")

app = FastAPI()


def initialize_database():
    try:
        models.Base.metadata.create_all(bind=engine)
    except DatabaseError:
        engine.dispose()

        if DATABASE_FILE.exists():
            backup_name = DATABASE_FILE.with_name(
                f"{DATABASE_FILE.stem}.corrupt.{datetime.now():%Y%m%d_%H%M%S}{DATABASE_FILE.suffix}"
            )
            DATABASE_FILE.replace(backup_name)

        models.Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def on_startup():
    initialize_database()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/students/", response_model=list[schemas.StudentResponse])
def read_students(db: Session = Depends(get_db)):
    return crud.get_students(db)


@app.post("/students/", response_model=schemas.StudentResponse)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    return crud.create_student(db=db, student=student)


@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    crud.delete_student(db, student_id)
    return {"message": "Success"}


if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_index():
    return FileResponse('static/student.html')