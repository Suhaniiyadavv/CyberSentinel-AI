"""
CyberSentinel AI - FastAPI Backend Application
AI-assisted Cyber Incident Detection and Automated Response Platform
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
import sqlite3
import os

app = FastAPI(
    title="CyberSentinel AI SOC API",
    description="AI-powered Cyber Incident Detection, MITRE ATT&CK Mapping & Response Platform",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "platform": "CyberSentinel AI",
        "status": "operational",
        "version": "2.4.0-SOC",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "engines": ["IsolationForest", "RandomForest", "SigmaEngine"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
