import { useState } from "react";
import MyMap from "../components/Map";
import "../css/index.css";
import ResponsiveAppBar from "../components/Toolbar";
import { useNavigate } from "react-router-dom";

const Report = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = () => {
    alert(`Incident Reported!\nTitle: ${title}\nDescription: ${description}`);
    const newPreview = {
      description: title,
      location: "User Selected Location (replace with actual location)", // Get location from map
      time: new Date().toLocaleString(), // Current time
    };
    navigate("/home", { state: { newPreview } });
  };

  return (
    <div>
      <ResponsiveAppBar />
      {/* Full-screen map */}
      <div className="map-container">
        <MyMap />
      </div>

      {/* Overlay for the form (on the left side) */}
      <div className="overlay">
        {/* Page Title */}
        <h1>Incident Report</h1>

        {/* Form Container */}
        <div className="flex-col">
          {/* Title Input */}
          <div className="flex-col">
            <label className="text-gray-700 font-semibold">Incident Title</label>
            <label className="text-gray-700 font-semibold">Mark a location via a pin</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a short title..."
            />
          </div>

          {/* Description Textarea */}
          <div className="flex-col">
            <label className="text-gray-700 font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident..."
              rows="4"
              className="textarea-custom"
            />
          </div>

          {/* Report Button */}
          <button onClick={handleSubmit} className="btn-primary">
            Report Incident
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;