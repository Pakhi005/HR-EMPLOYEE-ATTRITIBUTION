import React, { useState } from 'react';
import { schema, defaultCategorical, formatLabel } from '../schema';
import { Activity } from 'lucide-react';

export default function PredictionForm({ onPredict, isLoading, initialData }) {
  const [formData, setFormData] = useState(() => {
    if (initialData) return initialData;
    const initial = {};
    Object.entries(schema.numeric).forEach(([k, v]) => initial[k] = v.default);
    Object.entries(defaultCategorical).forEach(([k, v]) => initial[k] = v);
    return initial;
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  return (
    <div className="glass-card form-panel">
      <h2 className="section-title">
        <Activity className="section-icon" /> Employee Profile
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {Object.entries(schema.numeric).map(([key, rules]) => (
            <div key={key} className="input-group">
              <label htmlFor={key}>{formatLabel(key)}</label>
              <input
                type="number"
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                min={rules.min !== undefined ? rules.min : ''}
                max={rules.max !== undefined ? rules.max : ''}
                required
              />
            </div>
          ))}
          {Object.entries(schema.categorical).map(([key, options]) => (
            <div key={key} className="input-group">
              <label htmlFor={key}>{formatLabel(key)}</label>
              <select
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
              >
                {options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
              Analyzing...
            </>
          ) : (
            'Generate Prediction'
          )}
        </button>
      </form>
    </div>
  );
}
