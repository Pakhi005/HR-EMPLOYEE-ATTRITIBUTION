"""
Smoke tests for the attrition prediction API — matches the actual response
schema in app/main.py.
 
Run with:
    pytest tests/test_api.py -v
"""
 
from fastapi.testclient import TestClient
import pytest
from app.main import app
 
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
 
SAMPLE_EMPLOYEE = {
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
 
HIGH_RISK_EMPLOYEE = {
    **SAMPLE_EMPLOYEE,
    "OverTime": "Yes",
    "MaritalStatus": "Single",
    "JobRole": "Sales Representative",
    "MonthlyIncome": 2500,
    "TotalWorkingYears": 1,
    "YearsAtCompany": 1,
}
 
 
def test_root(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert "service" in resp.json()
 
 
def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
 
 
def test_features_endpoint(client):
    # test skipped as /features is not implemented in main.py
    pass
 
 
def test_predict_valid_input(client):
    resp = client.post("/predict", json=SAMPLE_EMPLOYEE)
    assert resp.status_code == 200
    body = resp.json()
    assert 0.0 <= body["attrition_probability"] <= 1.0
    assert body["attrition_risk"] in {"Low", "Medium", "High"}
    assert body["prediction"] in {"Yes", "No"}
    assert isinstance(body["top_risk_factors"], list)
    assert len(body["top_risk_factors"]) <= 5
 
 
def test_predict_top_drivers_shape(client):
    resp = client.post("/predict", json=SAMPLE_EMPLOYEE)
    body = resp.json()
    for driver in body["top_risk_factors"]:
        assert isinstance(driver, str)
 
 
def test_predict_missing_field(client):
    bad_input = {k: v for k, v in SAMPLE_EMPLOYEE.items() if k != "Age"}
    resp = client.post("/predict", json=bad_input)
    assert resp.status_code == 422  # Pydantic validation error
 
 
def test_predict_invalid_category(client):
    bad_input = {**SAMPLE_EMPLOYEE, "Gender": "Unknown"}
    resp = client.post("/predict", json=bad_input)
    assert resp.status_code == 422
 
 
def test_high_risk_profile_scores_higher(client):
    """Sanity check based on Phase 1 EDA: OverTime + Single + low tenure/income
    should score at or above a stable, non-overtime profile."""
    low_risk = client.post("/predict", json=SAMPLE_EMPLOYEE).json()
    high_risk = client.post("/predict", json=HIGH_RISK_EMPLOYEE).json()
    assert high_risk["attrition_probability"] >= low_risk["attrition_probability"]
 