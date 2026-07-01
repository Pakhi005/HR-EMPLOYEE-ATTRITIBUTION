const schema = {
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

const defaultCategorical = {
    "BusinessTravel": "Travel_Rarely",
    "Department": "Research & Development",
    "EducationField": "Life Sciences",
    "Gender": "Male",
    "JobRole": "Research Scientist",
    "MaritalStatus": "Married",
    "OverTime": "No"
};

function formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').trim();
}

function generateForm() {
    const container = document.getElementById('dynamic-fields');
    
    // Generate Numeric Fields
    for (const [key, rules] of Object.entries(schema.numeric)) {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        group.innerHTML = `
            <label for="${key}">${formatLabel(key)}</label>
            <input type="number" id="${key}" name="${key}" value="${rules.default}" min="${rules.min !== undefined ? rules.min : ''}" max="${rules.max !== undefined ? rules.max : ''}" required>
        `;
        container.appendChild(group);
    }

    // Generate Categorical Fields
    for (const [key, options] of Object.entries(schema.categorical)) {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        let optionsHtml = options.map(opt => `<option value="${opt}" ${opt === defaultCategorical[key] ? 'selected' : ''}>${opt.replace(/_/g, ' ')}</option>`).join('');
        
        group.innerHTML = `
            <label for="${key}">${formatLabel(key)}</label>
            <select id="${key}" name="${key}" required>
                ${optionsHtml}
            </select>
        `;
        container.appendChild(group);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateForm();

    const form = document.getElementById('prediction-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            if (key in schema.numeric) {
                data[key] = Number(value);
            } else {
                data[key] = value;
            }
        });

        // UI State: Loading
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('result-content').classList.add('hidden');
        document.getElementById('loading-state').classList.remove('hidden');

        try {
            const response = await fetch('http://127.0.0.1:8001/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('API Request failed');
            }

            const result = await response.json();
            
            // UI State: Results
            document.getElementById('loading-state').classList.add('hidden');
            const resultContent = document.getElementById('result-content');
            resultContent.classList.remove('hidden');

            // Update Risk Class
            resultContent.className = ''; // reset
            resultContent.classList.add(`risk-${result.attrition_risk.toLowerCase()}`);

            // Update Badge
            const badge = document.getElementById('risk-badge');
            badge.textContent = `${result.attrition_risk} Risk`;

            // Update Gauge
            const circle = document.getElementById('probability-circle');
            const text = document.getElementById('probability-text');
            const percentage = Math.round(result.attrition_probability * 100);
            
            // stroke-dasharray animation delay trick
            setTimeout(() => {
                circle.setAttribute('stroke-dasharray', `${percentage}, 100`);
            }, 50);
            text.textContent = `${percentage}%`;

            // Update Factors
            const factorsList = document.getElementById('top-factors-list');
            factorsList.innerHTML = '';
            
            if (result.top_risk_factors && result.top_risk_factors.length > 0) {
                result.top_risk_factors.forEach(factor => {
                    const cleanFactor = factor.replace('num__', '').replace('cat__', '').replace(/_/g, ' ');
                    const li = document.createElement('li');
                    li.textContent = cleanFactor;
                    factorsList.appendChild(li);
                });
            } else {
                factorsList.innerHTML = '<li>No significant factors identified</li>';
            }

        } catch (error) {
            console.error(error);
            alert("Error connecting to prediction API. Is the backend running on port 8001?");
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('empty-state').classList.remove('hidden');
        }
    });
});
