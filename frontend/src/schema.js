export const schema = {
  numeric: {
      "Age": { min: 18, max: 65, default: 35 },
      "DailyRate": { min: 0, default: 800 },
      "DistanceFromHome": { min: 0, default: 5 },
      "Education": { min: 1, max: 5, default: 3 },
      "EnvironmentSatisfaction": { min: 1, max: 4, default: 3 },
      "HourlyRate": { min: 0, default: 65 },
      "JobInvolvement": { min: 1, max: 4, default: 3 },
      "JobLevel": { min: 1, max: 5, default: 2 },
      "JobSatisfaction": { min: 1, max: 4, default: 3 },
      "MonthlyIncome": { min: 0, default: 5000 },
      "MonthlyRate": { min: 0, default: 15000 },
      "NumCompaniesWorked": { min: 0, default: 2 },
      "PercentSalaryHike": { min: 0, default: 15 },
      "PerformanceRating": { min: 1, max: 4, default: 3 },
      "RelationshipSatisfaction": { min: 1, max: 4, default: 3 },
      "StockOptionLevel": { min: 0, max: 3, default: 1 },
      "TotalWorkingYears": { min: 0, default: 10 },
      "TrainingTimesLastYear": { min: 0, default: 2 },
      "WorkLifeBalance": { min: 1, max: 4, default: 3 },
      "YearsAtCompany": { min: 0, default: 5 },
      "YearsInCurrentRole": { min: 0, default: 3 },
      "YearsSinceLastPromotion": { min: 0, default: 1 },
      "YearsWithCurrManager": { min: 0, default: 3 }
  },
  categorical: {
      "BusinessTravel": ["Travel_Rarely", "Travel_Frequently", "Non-Travel"],
      "Department": ["Sales", "Research & Development", "Human Resources"],
      "EducationField": ["Life Sciences", "Medical", "Marketing", "Technical Degree", "Human Resources", "Other"],
      "Gender": ["Male", "Female"],
      "JobRole": ["Sales Executive", "Research Scientist", "Laboratory Technician", "Manufacturing Director", "Healthcare Representative", "Manager", "Sales Representative", "Research Director", "Human Resources"],
      "MaritalStatus": ["Single", "Married", "Divorced"],
      "OverTime": ["Yes", "No"]
  }
};

export const defaultCategorical = {
  "BusinessTravel": "Travel_Rarely",
  "Department": "Research & Development",
  "EducationField": "Life Sciences",
  "Gender": "Male",
  "JobRole": "Research Scientist",
  "MaritalStatus": "Married",
  "OverTime": "No"
};

export function formatLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').trim();
}
