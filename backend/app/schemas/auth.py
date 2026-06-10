
from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    email: str  # Changed from EmailStr to str to avoid import errors temporarily

class UserCreatePatient(BaseModel):
    email: str
    password: str
    role: str  # "patient"
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None

class UserCreateDoctor(BaseModel):
    email: str
    password: str
    role: str  # "doctor"
    full_name: str
    specialization: str
    experience_years: int
    city: str
    qualifications: str
    clinic_name: str

class LoginRequest(BaseModel):
    email: str
    password: str
    required_role: str

class AuthResponse(BaseModel):
    success: bool
    user_id: int
    role: str
    full_name: str
    email: str
    message: Optional[str] = None
