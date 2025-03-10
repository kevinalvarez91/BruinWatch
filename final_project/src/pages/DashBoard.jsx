import React, { useState, useEffect } from 'react';
import '../css/Dashboard.css';
import ResponsiveAppBar from "../components/Toolbar";
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState({ totalIncidents: 0, activeReports: 0, resolvedIssues: 0 });
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/stats', { credentials: 'include' })
      .then(response => response.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));

    fetch('http://localhost:5001/reports', { credentials: 'include' })
      .then(response => response.json())
      .then(data => setReports(data))
      .catch(err => console.error("Error fetching reports:", err));
  }, []);

  const incidentsByDate = reports.reduce((acc, report) => {
    const date = report.created_at.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const sortedDates = Object.keys(incidentsByDate).sort();
  const lineChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Incidents Over Time',
        data: sortedDates.map(date => incidentsByDate[date]),
        fill: false,
        borderWidth: 2,
        tension: 0.1
      }
    ]
  };

  const incidentsByLocation = reports.reduce((acc, report) => {
    const location = report.location || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = {
    labels: Object.keys(incidentsByLocation),
    datasets: [
      {
        label: 'Incidents by Location',
        data: Object.values(incidentsByLocation),
        borderWidth: 1,
      }
    ]
  };

  // Chart.js options for the line chart
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to resize based on the container
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Incidents Over Time',
      },
    },
  };

  // Chart.js options for the pie chart
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to resize based on the container
    plugins: {
      legend: {
        position: 'right', // Move the legend to the right
        labels: {
          font: {
            size: 14, // Increase font size for better readability
          },
        },
      },
      title: {
        display: true,
        text: 'Incidents by Location',
      },
    },
  };

  return (
    <div className="dashboard">
      <ResponsiveAppBar />
      <h1>Dashboard</h1>
      
      {/* KPI Section */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h2>Total Incidents</h2>
          <p>{stats.totalIncidents}</p>
        </div>
        <div className="kpi-card">
          <h2>Active Reports</h2>
          <p>{stats.activeReports}</p>
        </div>
        <div className="kpi-card">
          <h2>Resolved Issues</h2>
          <p>{stats.resolvedIssues}</p>
        </div>
      </div>
      
      {/* Graphs Section */}
      <div className="graph-container">
        <div className="graph-card">
          <h3>Incidents Over Time</h3>
          <div className="graph-placeholder">
            {sortedDates.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <p>No data available for line chart.</p>
            )}
          </div>
        </div>
        <div className="graph-card">
          <h3>Incidents by Location</h3>
          <div className="graph-placeholder">
            {Object.keys(incidentsByLocation).length > 0 ? (
              <Pie data={pieChartData} options={pieChartOptions} />
            ) : (
              <p>No data available for pie chart.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;