from fastapi import FastAPI
from .database import engine, Base
from . import models


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hệ thống Quản lý Sinh viên")

@app.get("/")
def read_root():
    return {"message": "Hello Word"}