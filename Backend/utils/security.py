from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "default_refresh_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

app = FastAPI(title="Sign Language Learning and Assessment Platform", description="A platform to learn sign language through lessons and quizzes while using webcams to assess accuracy.", version="1.0.0")

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=30)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def create_refersh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=7)
    data.update({"exp": expire})
    return jwt.encode(data, REFRESH_SECRET_KEY, algorithm=ALGORITHM)