from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "patient" or "doctor"
    created_at = Column(DateTime, default=datetime.utcnow)

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    appointments_as_patient = relationship("Appointment", foreign_keys="[Appointment.patient_id]", back_populates="patient", cascade="all, delete-orphan")
    appointments_as_doctor = relationship("Appointment", foreign_keys="[Appointment.doctor_id]", back_populates="doctor", cascade="all, delete-orphan")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)

    user = relationship("User", back_populates="patient_profile")

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    experience_years = Column(Integer, nullable=False)
    city = Column(String, nullable=False)
    qualifications = Column(Text, nullable=False)
    clinic_name = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    profile_image_url = Column(String, nullable=True)
    registration_number = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    facebook_url = Column(String, nullable=True)

    user = relationship("User", back_populates="doctor_profile")

class ScanReport(Base):
    __tablename__ = "scan_reports"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    report_type = Column(String, nullable=False)  # "xray", "photo", "gemini", "document"
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=True)
    findings = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    ai_prediction = Column(String, nullable=True)  # e.g., "Dental Caries"
    confidence = Column(String, nullable=True)  # e.g., "87.3%"
    severity = Column(String, nullable=True)  # "None", "Mild", "Moderate", "Severe"
    status = Column(String, default="pending")  # "pending", "reviewed"
    image_data = Column(Text, nullable=True)  # Base64 encoded image
    result_json = Column(Text, nullable=True)  # JSON string of full results

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # "pending", "approved", "rejected", "completed", "cancelled"
    xray_report_id = Column(Integer, ForeignKey("scan_reports.id"), nullable=True)
    photo_report_id = Column(Integer, ForeignKey("scan_reports.id"), nullable=True)
    gemini_report_id = Column(Integer, ForeignKey("scan_reports.id"), nullable=True)
    appointment_date = Column(DateTime, nullable=True)
    doctor_note = Column(String, nullable=True)
    has_new_uploads = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments_as_patient")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="appointments_as_doctor")
    xray_report = relationship("ScanReport", foreign_keys=[xray_report_id])
    photo_report = relationship("ScanReport", foreign_keys=[photo_report_id])
    gemini_report = relationship("ScanReport", foreign_keys=[gemini_report_id])
    chat_messages = relationship("ChatMessage", back_populates="appointment", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    sender_role = Column(String, nullable=False)  # "patient" or "doctor"
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="chat_messages")
