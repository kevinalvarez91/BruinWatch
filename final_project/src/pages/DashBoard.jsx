import React from 'react';
import '../css/Dashboard.css';
import ResponsiveAppBar from "../components/Toolbar";


const Dashboard = () => {
  return (
    <div className="dashboard">
      <ResponsiveAppBar />
      <h1>Dashboard</h1>
      
      {/* KPI Section */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h2>Total Incidents</h2>
          <p>123</p>
        </div>
        <div className="kpi-card">
          <h2>Active Reports</h2>
          <p>45</p>
        </div>
        <div className="kpi-card">
          <h2>Resolved Issues</h2>
          <p>78</p>
        </div>
      </div>
      
      {/* Graphs Section */}
      <div className="graph-container">
        <div className="graph-card">
          <h3>Incidents Over Time</h3>
          <div className="graph-placeholder">
            <p>Graph Placeholder</p>
          </div>
        </div>
        <div className="graph-card">
          <h3>Incidents by Category</h3>
          <div className="graph-placeholder">
            <p>Graph Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
