import React, { useState, useEffect } from 'react';
import { Activity, Briefcase, DollarSign, Calendar } from 'lucide-react';
import PredictionForm from './components/PredictionForm';
import AnalyticsPanel from './components/AnalyticsPanel';
import PredictionHistory from './components/PredictionHistory';
import { defaultCategorical, schema } from './schema';

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // For the Employee Snapshot at top (defaults to empty or initial default values)
  const [snapshot, setSnapshot] = useState({
    age: schema.numeric.Age.default,
    experience: schema.numeric.TotalWorkingYears.default,
    income: schema.numeric.MonthlyIncome.default,
    role: defaultCategorical.JobRole
  });

  useEffect(() => {
    const saved = localStorage.getItem('attritionHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const handlePredict = async (formData) => {
    setIsLoading(true);
    setSnapshot({
      age: formData.Age,
      experience: formData.TotalWorkingYears,
      income: formData.MonthlyIncome,
      role: formData.JobRole
    });

    try {
      // Use VITE_API_URL env var (set to /api in Docker) with local dev fallback
      const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      
      setResult(data);

      // Save to history
      const now = new Date();
      const newEntry = {
        id: Date.now().toString(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        department: formData.Department,
        role: formData.JobRole,
        age: formData.Age,
        risk: data.attrition_risk,
        probability: Math.round(data.attrition_probability * 100)
      };
      
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('attritionHistory', JSON.stringify(updatedHistory));

    } catch (err) {
      console.error(err);
      alert("Error connecting to prediction API. Is the backend running on port 8001?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="dashboard-container">
        <header style={{textAlign: 'center', marginBottom: '1rem'}} className="animate-fade-in">
          <h1 style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem'}}>
            HR Analytics <span style={{background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Intelligence</span>
          </h1>
          <p className="text-muted">Enterprise Employee Attrition & Risk Dashboard</p>
        </header>

        {/* Employee Snapshot */}
        <div className="stats-row animate-fade-in delay-1">
          <div className="glass-card stat-card">
            <div className="stat-label flex items-center gap-2"><Activity size={16} className="text-accent"/> Age</div>
            <div className="stat-value">{snapshot.age}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label flex items-center gap-2"><Calendar size={16} className="text-accent"/> Experience</div>
            <div className="stat-value">{snapshot.experience} yrs</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label flex items-center gap-2"><DollarSign size={16} className="text-accent"/> Income</div>
            <div className="stat-value">${snapshot.income}/mo</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label flex items-center gap-2"><Briefcase size={16} className="text-accent"/> Role</div>
            <div className="stat-value" style={{fontSize: '1.2rem', marginTop: 'auto'}}>{snapshot.role}</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <PredictionForm onPredict={handlePredict} isLoading={isLoading} />
          <AnalyticsPanel result={result} />
        </div>

        <PredictionHistory history={history} setHistory={setHistory} />
      </div>
    </>
  );
}
