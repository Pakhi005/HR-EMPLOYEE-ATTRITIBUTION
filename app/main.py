"""
FastAPI service for the Employee Attrition Prediction model.

Loads:
  - models/preprocessor.pkl  -> sklearn ColumnTransformer/Pipeline
                                 (expects a raw DataFrame with num_cols + cat_cols,
                                 returns transformed numpy array)
  - models/xgb_attrition_model.pkl -> trained XGBoost classifier
  - models/feature_config.json -> num_cols / cat_cols used at train time

Run locally:
    uvicorn app.main:app --reload --port 8000

Then open http://localhost:8000/docs for interactive Swagger UI.
"""

import json
import logging
from pathlib import Path
from contextlib import asynccontextmanager

import joblib
import pandas as pd
import warnings
from sklearn.exceptions import InconsistentVersionWarning
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schema import EmployeeFeatures, PredictionResponse, HealthResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("attrition-api")

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

# Risk probability thresholds -- tune these against your Phase 2 precision/recall
# tradeoffs. XGBoost from Phase 2 had precision 0.70 / recall 0.30 at the default
# 0.5 threshold, so "High" risk here uses a slightly relaxed cutoff to catch more
# true leavers, matching the business framing from the notebook.
LOW_THRESHOLD = 0.30
HIGH_THRESHOLD = 0.55

ml_artifacts = {"model": None, "preprocessor": None, "feature_config": None}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup: load model artifacts once ---
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
    try:
        with open(MODELS_DIR / "feature_config.json") as f:
            ml_artifacts["feature_config"] = json.load(f)
        logger.info("Loaded feature_config.json")
    except Exception as e:
        logger.error(f"Failed to load feature_config.json: {e}")
        raise

    try:
        ml_artifacts["preprocessor"] = joblib.load(MODELS_DIR / "preprocessor.pkl")
        logger.info("Loaded preprocessor.pkl")
    except Exception as e:
        logger.error(f"Failed to load preprocessor.pkl: {e}")
        raise

    try:
        ml_artifacts["model"] = joblib.load(MODELS_DIR / "xgb_attrition_model.pkl")
        logger.info("Loaded xgb_attrition_model.pkl")
    except Exception as e:
        logger.error(f"Failed to load xgb_attrition_model.pkl: {e}")
        raise

    yield
    # --- Shutdown: nothing to clean up ---
    ml_artifacts.clear()


app = FastAPI(
    title="Employee Attrition Prediction API",
    description="Predicts attrition risk for an employee based on HR features "
                 "(IBM HR Employee Attrition dataset).",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow a local Streamlit dashboard / any frontend to call this API during dev.
# Lock this down to specific origins before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _risk_bucket(probability: float) -> str:
    if probability < LOW_THRESHOLD:
        return "Low"
    if probability < HIGH_THRESHOLD:
        return "Medium"
    return "High"


def _detailed_risk_factors(model, feature_names, top_n: int = 5) -> list[dict]:
    """Returns detailed feature importance with heuristic impact direction."""
    try:
        importances = model.feature_importances_
        pairs = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
        
        attrition_increasers = ["OverTime", "Distance", "NumCompanies"]
        
        factors = []
        for name, imp in pairs[:top_n]:
            clean_name = name.replace("num__", "").replace("cat__", "").replace("_", " ")
            impact = "negative" if any(inc in name for inc in attrition_increasers) else "positive"
            factors.append({
                "name": clean_name,
                "impact": impact,
                "importance": float(imp)
            })
        return factors
    except Exception:
        return []


@app.get("/", tags=["meta"])
def root():
    return {
        "service": "Employee Attrition Prediction API",
        "docs": "/docs",
        "health": "/health",
        "predict": "POST /predict",
    }


@app.get("/health", response_model=HealthResponse, tags=["meta"])
def health():
    return HealthResponse(
        status="ok",
        model_loaded=ml_artifacts["model"] is not None,
        preprocessor_loaded=ml_artifacts["preprocessor"] is not None,
    )


@app.post("/predict", response_model=PredictionResponse, tags=["prediction"])
def predict(employee: EmployeeFeatures):
    model = ml_artifacts["model"]
    preprocessor = ml_artifacts["preprocessor"]
    feature_config = ml_artifacts["feature_config"]

    if model is None or preprocessor is None:
        raise HTTPException(status_code=503, detail="Model artifacts not loaded")

    ordered_cols = feature_config["num_cols"] + feature_config["cat_cols"]

    try:
        row = employee.model_dump()
        df = pd.DataFrame([row], columns=ordered_cols)
        X_transformed = preprocessor.transform(df)
        probability = float(model.predict_proba(X_transformed)[0][1])
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    risk = _risk_bucket(probability)
    prediction = "Yes" if probability >= 0.5 else "No"
    confidence_score = max(probability, 1.0 - probability)

    try:
        feature_names = preprocessor.get_feature_names_out()
    except Exception:
        feature_names = ordered_cols
        
    detailed_factors = _detailed_risk_factors(model, feature_names, top_n=5)
    top_factors = [f["name"] for f in detailed_factors]

    return PredictionResponse(
        attrition_risk=risk,
        attrition_probability=round(probability, 4),
        confidence_score=round(confidence_score, 4),
        prediction=prediction,
        top_risk_factors=top_factors,
        detailed_factors=detailed_factors,
    )
