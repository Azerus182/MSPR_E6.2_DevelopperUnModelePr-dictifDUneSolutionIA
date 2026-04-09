from fastapi import FastAPI, HTTPException, Request
from databases import Database
import os
from contextlib import asynccontextmanager
import hashlib
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from typing import Optional

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
TOKEN_TIME = 60 * 3 # 3 hours

db = Database(DATABASE_URL)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    username: str
    password: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

app = FastAPI(lifespan=lifespan)

def create_access_token(data: dict):
    token = data.copy()
    token["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_TIME)
    return (jwt.encode(token, SECRET_KEY, algorithm=ALGORITHM))

def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/users")
async def read_users():
    query = "SELECT id, username FROM User"
    rows = await db.fetch_all(query)
    return [dict(row) for row in rows]


@app.post("/register")
async def register_user(user: User):
    username = user.username.strip()
    password = user.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    check_query = "SELECT * FROM User WHERE username = :username"
    existing_user = await db.fetch_one(check_query, {"username": username})

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    await db.execute(
        """
            INSERT INTO User (username, password)
            VALUES (:username, :password)
        """,
        {
        "username": username,
        "password": pwd_context.hash(password)
    })
    return {"message": "User registered successfully"}

@app.post("/login")
async def login_user(user: User):
    username = user.username.strip()
    password = user.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    query = "SELECT * FROM User WHERE username = :username"
    existing_user = await db.fetch_one(query, {"username": username})

    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not pwd_context.verify(password, existing_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": username})

    return {"access_token": access_token, "token_type": "bearer"}
