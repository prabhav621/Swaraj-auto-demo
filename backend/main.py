from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from rapidfuzz import fuzz

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Application(BaseModel):
    id: str | int
    name: str
    father_name: str
    tehsil: str
    income: float
    land_holding_ha: float

class StatusResult(BaseModel):
    id: str | int
    name: str
    tehsil: str
    status: str # STATUS_AUTO_APPROVE, STATUS_FIELD_VERIFICATION, STATUS_REJECTED
    reason: Optional[str] = None
    match_score: Optional[float] = None
    
# Load data once at startup
try:
    df = pd.read_csv("government_master_data.csv")
except Exception as e:
    df = pd.DataFrame()
    print("Warning: government_master_data.csv not found or unreadable")

@app.post("/batch-process", response_model=List[StatusResult])
def batch_process(applications: List[Application]):
    results = []
    for app in applications:
        # Check eligibility first
        reason = None
        if app.income >= 200000:
            reason = f"Income of {app.income} exceeds BPL limit (2L)."
        elif app.land_holding_ha >= 2.0:
            reason = f"Land holding of {app.land_holding_ha} Ha exceeds limit (2 Ha)."
            
        if reason:
            results.append(StatusResult(
                id=app.id,
                name=app.name,
                tehsil=app.tehsil,
                status="STATUS_REJECTED",
                reason=reason,
                match_score=None
            ))
            continue
            
        # Eligible by criteria, now do fuzzy matching against government_master_data.csv
        # Filter by tehsil for performance
        tehsil_df = df[df['tehsil'] == app.tehsil]
        
        best_score = 0.0
        
        for _, row in tehsil_df.iterrows():
            # Match on name and father_name
            name_score = fuzz.ratio(str(app.name).lower(), str(row['name']).lower())
            fname_score = fuzz.ratio(str(app.father_name).lower(), str(row['father_name']).lower())
            # Weighted score: Name is more important
            avg_score = (name_score * 0.7 + fname_score * 0.3)
            if avg_score > best_score:
                best_score = avg_score
                
        # Normalize to 0-1
        normalized_score = best_score / 100.0
        
        if normalized_score >= 0.95:
            results.append(StatusResult(
                id=app.id,
                name=app.name,
                tehsil=app.tehsil,
                status="STATUS_AUTO_APPROVE",
                reason="Match >= 0.95 and Eligibility criteria met.",
                match_score=normalized_score
            ))
        elif normalized_score >= 0.80:
            results.append(StatusResult(
                id=app.id,
                name=app.name,
                tehsil=app.tehsil,
                status="STATUS_FIELD_VERIFICATION",
                reason="Needs field verification (Fuzzy match between 80% and 95%).",
                match_score=normalized_score
            ))
        else:
            results.append(StatusResult(
                id=app.id,
                name=app.name,
                tehsil=app.tehsil,
                status="STATUS_REJECTED",
                reason=f"Failed identity check (Max Match Score = {normalized_score:.2f}).",
                match_score=normalized_score
            ))
            
    return results
