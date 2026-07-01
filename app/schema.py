"""
Pydantic schemas for the attrition prediction API.

Field set matches models/feature_config.json exactly (23 numeric + 7 categorical).
Categorical value options are the standard values found in the IBM HR Employee
Attrition dataset. If your Phase 2 notebook did anything custom (renamed
categories, dropped a class, etc.), update the Literal lists below to match.
"""

from typing import Literal
from pydantic import BaseModel, Field


class EmployeeFeatures(BaseModel):
    # --- Numeric features (23) ---
    Age: int = Field(..., ge=18, le=65, json_schema_extra={"example": 35})
    DailyRate: int = Field(..., ge=0, json_schema_extra={"example": 800})
    DistanceFromHome: int = Field(..., ge=0, json_schema_extra={"example": 5})
    Education: int = Field(..., ge=1, le=5, description="1=Below College ... 5=Doctor", json_schema_extra={"example": 3})
    EnvironmentSatisfaction: int = Field(..., ge=1, le=4, json_schema_extra={"example": 3})
    HourlyRate: int = Field(..., ge=0, json_schema_extra={"example": 65})
    JobInvolvement: int = Field(..., ge=1, le=4, json_schema_extra={"example": 3})
    JobLevel: int = Field(..., ge=1, le=5, json_schema_extra={"example": 2})
    JobSatisfaction: int = Field(..., ge=1, le=4, json_schema_extra={"example": 3})
    MonthlyIncome: int = Field(..., ge=0, json_schema_extra={"example": 5000})
    MonthlyRate: int = Field(..., ge=0, json_schema_extra={"example": 15000})
    NumCompaniesWorked: int = Field(..., ge=0, json_schema_extra={"example": 2})
    PercentSalaryHike: int = Field(..., ge=0, json_schema_extra={"example": 15})
    PerformanceRating: int = Field(..., ge=1, le=4, json_schema_extra={"example": 3})
    RelationshipSatisfaction: int = Field(..., ge=1, le=4, json_schema_extra={"example": 3})
    StockOptionLevel: int = Field(..., ge=0, le=3, json_schema_extra={"example": 1})
    TotalWorkingYears: int = Field(..., ge=0, json_schema_extra={"example": 10})
    TrainingTimesLastYear: int = Field(..., ge=0, json_schema_extra={"example": 2})
    WorkLifeBalance: int = Field(..., ge=1, le=4, json_schema_extra={"example": 3})
    YearsAtCompany: int = Field(..., ge=0, json_schema_extra={"example": 5})
    YearsInCurrentRole: int = Field(..., ge=0, json_schema_extra={"example": 3})
    YearsSinceLastPromotion: int = Field(..., ge=0, json_schema_extra={"example": 1})
    YearsWithCurrManager: int = Field(..., ge=0, json_schema_extra={"example": 3})

    # --- Categorical features (7) ---
    BusinessTravel: Literal["Travel_Rarely", "Travel_Frequently", "Non-Travel"] = Field(
        ..., json_schema_extra={"example": "Travel_Rarely"}
    )
    Department: Literal["Sales", "Research & Development", "Human Resources"] = Field(
        ..., json_schema_extra={"example": "Research & Development"}
    )
    EducationField: Literal[
        "Life Sciences", "Medical", "Marketing", "Technical Degree",
        "Human Resources", "Other"
    ] = Field(..., json_schema_extra={"example": "Life Sciences"})
    Gender: Literal["Male", "Female"] = Field(..., json_schema_extra={"example": "Male"})
    JobRole: Literal[
        "Sales Executive", "Research Scientist", "Laboratory Technician",
        "Manufacturing Director", "Healthcare Representative", "Manager",
        "Sales Representative", "Research Director", "Human Resources"
    ] = Field(..., json_schema_extra={"example": "Research Scientist"})
    MaritalStatus: Literal["Single", "Married", "Divorced"] = Field(..., json_schema_extra={"example": "Married"})
    OverTime: Literal["Yes", "No"] = Field(..., json_schema_extra={"example": "No"})

    model_config = {
        "json_schema_extra": {
            "example": {
                "Age": 35, "DailyRate": 800, "DistanceFromHome": 5, "Education": 3,
                "EnvironmentSatisfaction": 3, "HourlyRate": 65, "JobInvolvement": 3,
                "JobLevel": 2, "JobSatisfaction": 3, "MonthlyIncome": 5000,
                "MonthlyRate": 15000, "NumCompaniesWorked": 2, "PercentSalaryHike": 15,
                "PerformanceRating": 3, "RelationshipSatisfaction": 3, "StockOptionLevel": 1,
                "TotalWorkingYears": 10, "TrainingTimesLastYear": 2, "WorkLifeBalance": 3,
                "YearsAtCompany": 5, "YearsInCurrentRole": 3, "YearsSinceLastPromotion": 1,
                "YearsWithCurrManager": 3, "BusinessTravel": "Travel_Rarely",
                "Department": "Research & Development", "EducationField": "Life Sciences",
                "Gender": "Male", "JobRole": "Research Scientist",
                "MaritalStatus": "Married", "OverTime": "No"
            }
        }
    }


class Factor(BaseModel):
    name: str
    impact: Literal["positive", "negative"]
    importance: float

class PredictionResponse(BaseModel):
    attrition_risk: Literal["Low", "Medium", "High"]
    attrition_probability: float = Field(..., description="Model probability of attrition (0-1)")
    confidence_score: float = Field(..., description="Confidence in the prediction (max of prob or 1-prob)")
    prediction: Literal["Yes", "No"]
    top_risk_factors: list[str] = Field(
        default_factory=list,
        description="Feature names contributing most to this prediction"
    )
    detailed_factors: list[Factor] = Field(
        default_factory=list,
        description="Detailed breakdown of important features with weights and direction"
    )


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    preprocessor_loaded: bool
