import React, { useState } from 'react';
import { History, Download, FileText, Trash2, Search } from 'lucide-react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

export default function PredictionHistory({ history, setHistory }) {
  const [searchTerm, setSearchTerm] = useState("");

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.removeItem('attritionHistory');
    }
  };

  const deleteRow = (id) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('attritionHistory', JSON.stringify(newHistory));
  };

  const exportCSV = () => {
    const csv = Papa.unparse(history.map(h => ({
      Date: h.date,
      Time: h.time,
      Department: h.department,
      JobRole: h.role,
      Age: h.age,
      Risk: h.risk,
      Probability: h.probability
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attrition_history.csv';
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Employee Attrition Prediction History", 14, 15);
    
    // Very simple table generation (jspdf-autotable is usually better but this works for basic needs)
    let y = 30;
    doc.setFontSize(10);
    doc.text("Date", 14, y);
    doc.text("Dept", 50, y);
    doc.text("Role", 90, y);
    doc.text("Risk", 140, y);
    doc.text("Prob", 170, y);
    
    y += 10;
    history.forEach(h => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(h.date, 14, y);
      doc.text(h.department.substring(0, 15), 50, y);
      doc.text(h.role.substring(0, 15), 90, y);
      doc.text(h.risk, 140, y);
      doc.text(h.probability + "%", 170, y);
      y += 10;
    });
    
    doc.save('attrition_history.pdf');
  };

  const filtered = history.filter(h => 
    h.department.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.risk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (history.length === 0) return null;

  return (
    <div className="glass-card mt-8 animate-fade-in delay-3" style={{marginTop: '2rem'}}>
      <div className="flex justify-between items-center mb-6">
        <div className="section-title mb-0 border-0"><History className="section-icon" /> Prediction History</div>
        <div className="flex gap-2">
          <div className="input-group" style={{flexDirection: 'row', alignItems: 'center'}}>
            <Search size={16} className="text-muted absolute ml-2" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm} 
              onChange={e=>setSearchTerm(e.target.value)}
              style={{paddingLeft: '2rem', padding: '0.5rem 0.5rem 0.5rem 2rem'}}
            />
          </div>
          <button onClick={exportCSV} className="btn-secondary" title="Export CSV"><Download size={16} /> CSV</button>
          <button onClick={exportPDF} className="btn-secondary" title="Export PDF"><FileText size={16} /> PDF</button>
          <button onClick={clearHistory} className="btn-secondary" style={{color: 'var(--risk-high)'}} title="Clear"><Trash2 size={16} /></button>
        </div>
      </div>

      <div style={{overflowX: 'auto'}}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Department</th>
              <th>Role</th>
              <th>Age</th>
              <th>Risk Assessment</th>
              <th>Probability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td className="text-muted">{row.time}</td>
                <td>{row.department}</td>
                <td>{row.role}</td>
                <td>{row.age}</td>
                <td><span className={`risk-badge badge-${row.risk.toLowerCase()}`} style={{padding: '0.2rem 0.5rem', fontSize: '0.8rem'}}>{row.risk}</span></td>
                <td>{row.probability}%</td>
                <td><button onClick={() => deleteRow(row.id)} className="btn-secondary" style={{padding: '0.2rem 0.5rem'}}><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>No history matches your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
