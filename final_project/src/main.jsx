import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage.jsx";
import Contact from "./pages/Contact";
import Report from "./pages/IncidentReport.jsx";
import IncidentPage from "./pages/IncidentPage.jsx";

//This is a test for pushing

import "./css/index.css"; // Ensure styles are applied

console.log("main.jsx is running!"); // Debugging log

const App = () => {
  console.log("App is rendering!"); // Debugging log
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/report" element={<Report />} />
        <Route path="/IncidentPage" element={<IncidentPage />} />

      </Routes>
    </Router>
  );
};

// Ensure we are rendering the app correctly
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
} else {
  console.error("No root element found!");
}
