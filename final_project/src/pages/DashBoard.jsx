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

  // Set chart global defaults
  useEffect(() => {
    // Set global chart defaults
    ChartJS.defaults.font.family = "'Roboto', 'Segoe UI', sans-serif";
    ChartJS.defaults.color = '#555';
    ChartJS.defaults.font.size = 12;
    ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    ChartJS.defaults.plugins.tooltip.padding = 10;
    ChartJS.defaults.plugins.tooltip.cornerRadius = 6;
    ChartJS.defaults.plugins.tooltip.titleFont = { weight: 'bold', size: 14 };

    
    // Fetch data
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
  
  // Enhanced line chart data with gradient
  const lineChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Incidents Over Time',
        data: sortedDates.map(date => incidentsByDate[date]),
        fill: true,
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(54, 162, 235, 0.1)');
          gradient.addColorStop(1, 'rgba(54, 162, 235, 0.4)');
          return gradient;
        },
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        pointHoverBorderWidth: 2,
        tension: 0.3
      }
    ]
  };

  const incidentsByLocation = reports.reduce((acc, report) => {
    const location = report.location || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  // Get all unique location labels
  const locationLabels = Object.keys(incidentsByLocation);

  // Generate enhanced colors using HSL with better saturation and lightness
  const generateEnhancedColors = (numColors) => {
    const colors = [];
    const backgroundColors = [];
    const borderColors = [];
    
    for (let i = 0; i < numColors; i++) {
      const hue = Math.round((360 / numColors) * i);
      const bgColor = `hsla(${hue}, 80%, 65%, 0.8)`;
      const borderColor = `hsla(${hue}, 90%, 45%, 1)`;
      
      backgroundColors.push(bgColor);
      borderColors.push(borderColor);
    }
    
    return { backgroundColors, borderColors };
  };

  const { backgroundColors, borderColors } = generateEnhancedColors(locationLabels.length);

  const pieChartData = {
    labels: locationLabels,
    datasets: [
      {
        label: 'Incidents by Location',
        data: Object.values(incidentsByLocation),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverOffset: 15
      }
    ]
  };

  // Enhanced Chart.js options for the line chart
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Incidents Over Time',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        usePointStyle: true,
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            return `Incidents: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          precision: 0,
          font: {
            size: 12
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    layout: {
      padding: 10
    }
  };

  // Enhanced Chart.js options for the pie chart
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 10,
          boxHeight: 10,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Incidents by Location',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    layout: {
      padding: 20
    }
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
              <div className="no-data">
                <i className="far fa-chart-bar"></i>
                <p>No data available for line chart.</p>
              </div>
            )}
          </div>
        </div>
        <div className="graph-card">
          <h3>Incidents by Location</h3>
          <div className="graph-placeholder">
            {locationLabels.length > 0 ? (
              <Pie data={pieChartData} options={pieChartOptions} />
            ) : (
              <div className="no-data">
                <i className="far fa-chart-pie"></i>
                <p>No data available for pie chart.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;